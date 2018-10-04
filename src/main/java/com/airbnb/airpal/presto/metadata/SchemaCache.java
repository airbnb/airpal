package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.core.BackgroundCacheLoader;
import com.airbnb.airpal.core.execution.QueryClient;
import com.airbnb.airpal.presto.QueryRunner;
import com.facebook.presto.client.QueryData;
import com.facebook.presto.client.QueryResults;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Function;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nullable;

import java.io.Closeable;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.String.format;

@Slf4j
public class SchemaCache
        implements Closeable
{
    private static final long RELOAD_TIME_MINUTES = 2;
    private static final Set<String> EXCLUDED_SCHEMAS = Sets.newHashSet("sys", "information_schema");

    private final ExecutorService executor;
    private final QueryRunner.QueryRunnerFactory queryRunnerFactory;
    private final LoadingCache<String, Map<String, List<String>>> schemaTableCache;

    public SchemaCache(final QueryRunner.QueryRunnerFactory queryRunnerFactory,
            final ExecutorService executor)
    {
        this.queryRunnerFactory = checkNotNull(queryRunnerFactory, "queryRunnerFactory session was null!");
        this.executor = checkNotNull(executor, "executor was null!");

        ListeningExecutorService listeningExecutor = MoreExecutors.listeningDecorator(executor);
        BackgroundCacheLoader<String, Map<String, List<String>>> loader =
                new BackgroundCacheLoader<String, Map<String, List<String>>>(listeningExecutor)
                {
                    @Override
                    public Map<String, List<String>> load(String catalogName)
                    {
                        return queryMetadata(format(
                                "SELECT table_catalog, table_schema, table_name " +
                                        "FROM information_schema.tables " +
                                        "WHERE table_catalog = '%s'",
                                catalogName));
                    }
                };

        schemaTableCache = CacheBuilder.newBuilder()
                .refreshAfterWrite(RELOAD_TIME_MINUTES, TimeUnit.MINUTES)
                .build(loader);
    }

    private Map<String, List<String>> queryMetadata(String query)
    {
        final Map<String, List<String>> cache = Maps.newHashMap();
        QueryRunner queryRunner = queryRunnerFactory.create();
        QueryClient queryClient = new QueryClient(queryRunner, io.dropwizard.util.Duration.seconds(60), query);

        try {
            queryClient.executeWith(new Function<StatementClient, Void>() {
                @Nullable
                @Override
                public Void apply(StatementClient client)
                {
                    QueryData results = client.currentData();
                    if (results.getData() != null) {
                        for (List<Object> row : results.getData()) {
                            String schema = (String) row.get(1);
                            String table = (String) row.get(2);

                            if (EXCLUDED_SCHEMAS.contains(schema)) {
                                continue;
                            }

                            List<String> tables = cache.get(schema);

                            if (tables == null) {
                                tables = Lists.newArrayList();
                                cache.put(schema, tables);
                            }

                            tables.add(table);
                        }
                    }

                    return null;
                }
            });
        }
        catch (QueryClient.QueryTimeOutException e) {
            log.error("Caught timeout loading columns", e);
        }

        return ImmutableMap.copyOf(cache);
    }

    public void populateCache(final String catalog)
    {
        checkNotNull(catalog, "schemaName is null");
        executor.execute(new Runnable()
        {
            @Override
            public void run()
            {
                schemaTableCache.refresh(catalog);
            }
        });
    }

    public Set<String> getCatalogs()
    {
        return schemaTableCache.asMap().keySet();
    }

    public Map<String, List<String>> getSchemaMap(final String catalog)
    {
        try {
            return schemaTableCache.get(catalog);
        }
        catch (ExecutionException e) {
            e.printStackTrace();
            return Maps.newHashMap();
        }
    }

    @Override
    public void close()
    {
        executor.shutdownNow();
    }

    public static ThreadFactory daemonThreadsNamed(String nameFormat)
    {
        return new ThreadFactoryBuilder().setNameFormat(nameFormat).setDaemon(true).build();
    }
}
