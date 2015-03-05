package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.api.ExecutionRequest;
import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.airbnb.airpal.api.event.JobFinishedEvent;
import com.airbnb.airpal.api.output.HiveTablePersistentOutput;
import com.airbnb.airpal.api.output.PersistentJobOutputFactory;
import com.airbnb.airpal.api.output.builders.OutputBuilderFactory;
import com.airbnb.airpal.api.output.persistors.PersistorFactory;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.store.history.JobHistoryStore;
import com.airbnb.airpal.core.store.jobs.ActiveJobsStore;
import com.airbnb.airpal.core.store.usage.UsageStore;
import com.airbnb.airpal.presto.QueryInfoClient;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.metadata.ColumnCache;
import com.airbnb.airpal.presto.metadata.SchemaCache;
import com.facebook.presto.client.Column;
import com.facebook.presto.client.QueryError;
import com.google.common.eventbus.EventBus;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.inject.Inject;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;
import org.joda.time.DateTime;
import org.joda.time.Duration;

import javax.annotation.Nullable;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

import static com.airbnb.airpal.presto.QueryRunner.QueryRunnerFactory;

public class ExecutionClient
{
    private final ListeningExecutorService executor = MoreExecutors.listeningDecorator(
            Executors.newCachedThreadPool(SchemaCache.daemonThreadsNamed("execution-client-%d")));

    @Getter
    private final EventBus eventBus;
    @Getter
    private final JobHistoryStore historyStore;
    private final PersistentJobOutputFactory persistentJobOutputFactory;
    @Getter
    private final UsageStore usageStore;
    @Getter
    private final SchemaCache schemaCache;
    private final ColumnCache columnCache;
    private final QueryInfoClient queryInfoClient;
    private final QueryRunnerFactory queryRunnerFactory;
    private final ActiveJobsStore activeJobsStore;
    private final OutputBuilderFactory outputBuilderFactory;
    private final PersistorFactory persistorFactory;
    private final Map<UUID, Execution> executionMap = new ConcurrentHashMap<>();

    @Inject
    public ExecutionClient(QueryRunnerFactory queryRunnerFactory,
            EventBus eventBus,
            JobHistoryStore historyStore,
            PersistentJobOutputFactory persistentJobOutputFactory,
            UsageStore usageStore,
            SchemaCache schemaCache,
            ColumnCache columnCache,
            QueryInfoClient queryInfoClient,
            ActiveJobsStore activeJobsStore,
            OutputBuilderFactory outputBuilderFactory,
            PersistorFactory persistorFactory)
    {
        this.queryRunnerFactory = queryRunnerFactory;
        this.eventBus = eventBus;
        this.historyStore = historyStore;
        this.persistentJobOutputFactory = persistentJobOutputFactory;
        this.usageStore = usageStore;
        this.schemaCache = schemaCache;
        this.columnCache = columnCache;
        this.queryInfoClient = queryInfoClient;
        this.activeJobsStore = activeJobsStore;
        this.outputBuilderFactory = outputBuilderFactory;
        this.persistorFactory = persistorFactory;
    }

    public UUID runQuery(final ExecutionRequest request,
            final AirpalUser user,
            final String schema,
            final Duration timeout)
    {
        return runQuery(request.getQuery(), request.getTmpTable(), user, schema, timeout);
    }

    public UUID runQuery(final String query,
            final String tmpTable,
            final AirpalUser user,
            final String schema,
            final Duration timeout)
    {
        final UUID uuid = UUID.randomUUID();
        final Job job = new Job(user.getUserName(),
                                query,
                                uuid,
                                persistentJobOutputFactory.create(tmpTable, uuid),
                                null,
                                JobState.QUEUED,
                                Collections.<Column>emptyList(),
                                null,
                                null
        );

        final Execution execution = new Execution(job,
                eventBus,
                queryRunnerFactory.create(user.getUserName(), schema),
                queryInfoClient,
                new QueryExecutionAuthorizer(user, "hive", user.getDefaultSchema()),
                timeout,
                columnCache,
                outputBuilderFactory,
                persistorFactory);

        executionMap.put(uuid, execution);
        activeJobsStore.jobStarted(job);

        ListenableFuture<Job> result = executor.submit(execution);
        Futures.addCallback(result, new FutureCallback<Job>()
        {
            @Override
            public void onSuccess(@Nullable Job result)
            {
                if (result != null) {
                    result.setState(JobState.FINISHED);
                }
                jobFinished(result);
            }

            @Override
            public void onFailure(@NotNull Throwable t)
            {
                if (t instanceof ExecutionFailureException) {
                    ExecutionFailureException e = (ExecutionFailureException) t;
                    Job j = e.getJob();
                    j.setState(JobState.FAILED);
                    if (j.getError() == null) {
                        j.setError(new QueryError(e.getMessage(), null, -1, null, null));
                    }

                    jobFinished(j);
                }
            }
        });

        return uuid;
    }

    protected void jobFinished(Job job)
    {
        job.setQueryFinished(new DateTime());
        activeJobsStore.jobFinished(job);
        historyStore.addRun(job);

        for (Table t : job.getTablesUsed()) {
            usageStore.markUsage(t);
        }

        if (job.getOutput() instanceof HiveTablePersistentOutput && job.getOutput().getLocation() != null) {
            String[] parts = job.getOutput().getLocation().toString().split("\\.");
            if (parts.length == 2) {
                Map<String, List<String>> cache = schemaCache.getSchemaMap("hive");
                List<String> tables = cache.get(parts[0]);
                tables.add(parts[1]);
            }
        }

        eventBus.post(new JobFinishedEvent(job));
        executionMap.remove(job.getUuid());
    }

    public boolean cancelQuery(
            AirpalUser user,
            UUID uuid)
    {
        Execution execution = executionMap.get(uuid);

        if ((execution != null) && (execution.getJob().getUser().equals(user.getUserName()))) {
            execution.cancel();
            return true;
        } else {
            return false;
        }
    }

    public static class ExecutionFailureException extends RuntimeException
    {
        @Getter
        private final Job job;

        public ExecutionFailureException(Job job, String message, Throwable cause)
        {
            super(message, cause);
            this.job = job;
        }
    }
}
