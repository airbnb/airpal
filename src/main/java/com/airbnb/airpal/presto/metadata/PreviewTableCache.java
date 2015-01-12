package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.core.BackgroundCacheLoader;
import com.airbnb.airpal.core.execution.QueryClient;
import com.airbnb.airpal.presto.QueryRunner;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.Util;
import com.facebook.presto.client.QueryResults;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Function;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import io.airlift.units.Duration;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nullable;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

import static com.google.common.base.Preconditions.checkNotNull;

@Slf4j
public class PreviewTableCache
{
    private final LoadingCache<Table, List<List<Object>>> previewTableCache;
    private final QueryRunner.QueryRunnerFactory queryRunnerFactory;

    public PreviewTableCache(final QueryRunner.QueryRunnerFactory queryRunnerFactory,
                             final Duration previewCacheLifetime,
                             final ExecutorService executor,
                             final int previewLimit)
    {
        this.queryRunnerFactory = checkNotNull(queryRunnerFactory, "queryRunnerFactory session was null!");

        ListeningExecutorService listeningExecutor = MoreExecutors.listeningDecorator(executor);

        BackgroundCacheLoader<Table, List<List<Object>>> tableLoader =
                new BackgroundCacheLoader<Table, List<List<Object>>>(listeningExecutor)
        {
            @Override
            public List<List<Object>> load(Table tbl) throws Exception {
                return queryRows(String.format("SELECT * FROM %s LIMIT %d",
                        Util.fqn(tbl.getSchema(), tbl.getTable()),
                        previewLimit));
            }
        };

        this.previewTableCache = CacheBuilder.newBuilder()
                                            .expireAfterWrite(Math.round(previewCacheLifetime.getValue()),
                                                              previewCacheLifetime.getUnit())
                                            .build(tableLoader);
    }

    private List<List<Object>> queryRows(String query)
    {
        final ImmutableList.Builder<List<Object>> cache = ImmutableList.builder();
        QueryRunner queryRunner = queryRunnerFactory.create();
        QueryClient queryClient = new QueryClient(queryRunner, io.dropwizard.util.Duration.seconds(60), query);

        try {
            queryClient.executeWith(new Function<StatementClient, Void>() {
                @Nullable
                @Override
                public Void apply(StatementClient client)
                {
                    QueryResults results = client.current();
                    if (results.getData() != null) {
                        cache.addAll(results.getData());
                    }

                    return null;
                }
            });
        }
        catch (QueryClient.QueryTimeOutException e) {
            log.error("Caught timeout loading columns", e);
        }

        return cache.build();
    }

    public List<List<Object>> getPreview(final String databaseName,
                                         final String tableName) throws ExecutionException {
        return previewTableCache.get(new Table("hive", databaseName, tableName));
    }
}
