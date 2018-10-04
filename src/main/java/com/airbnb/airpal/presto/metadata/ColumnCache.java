package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.core.BackgroundCacheLoader;
import com.airbnb.airpal.core.execution.QueryClient;
import com.airbnb.airpal.presto.QueryRunner;
import com.airbnb.airpal.presto.Util;
import com.airbnb.airpal.presto.hive.HiveColumn;
import com.airbnb.airpal.presto.hive.HivePartition;
import com.airbnb.airpal.util.ConvertUtils;
import com.facebook.presto.client.*;
import com.facebook.presto.spi.type.TypeSignature;
import com.google.common.base.Function;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import io.airlift.units.Duration;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nullable;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

import static com.airbnb.airpal.presto.QueryRunner.QueryRunnerFactory;
import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.String.format;

@Slf4j
public class ColumnCache
{
    private final LoadingCache<String, List<HiveColumn>> schemaTableCache;
    private final LoadingCache<String, List<HivePartition>> partitionCache;
    private final QueryRunnerFactory queryRunnerFactory;

    public ColumnCache(final QueryRunnerFactory queryRunnerFactory,
                       final Duration columnCacheLifetime,
                       final Duration partitionCacheLifetime,
                       final ExecutorService executor)
    {
        this.queryRunnerFactory = checkNotNull(queryRunnerFactory, "queryRunnerFactory session was null!");
        checkNotNull(executor, "executor was null!");

        ListeningExecutorService listeningExecutor = MoreExecutors.listeningDecorator(executor);

        BackgroundCacheLoader<String, List<HiveColumn>> columnLoader = new BackgroundCacheLoader<String,
                List<HiveColumn>>(listeningExecutor)
        {
            @Override
            public List<HiveColumn> load(String fqTableName)
            {
                return queryColumns(format("SHOW COLUMNS FROM %s", fqTableName));
            }
        };

        BackgroundCacheLoader<String, List<HivePartition>> partitionLoader = new BackgroundCacheLoader<String,
                List<HivePartition>>(listeningExecutor)
        {
            @Override
            public List<HivePartition> load(String fqTableName) throws Exception
            {
                return queryPartitions(format("SHOW PARTITIONS FROM %s", fqTableName));
            }
        };

        this.schemaTableCache = CacheBuilder.newBuilder()
                                            .expireAfterWrite(Math.round(columnCacheLifetime.getValue()),
                                                              columnCacheLifetime.getUnit())
                                            .build(columnLoader);
        this.partitionCache = CacheBuilder.newBuilder()
                                          .expireAfterWrite(Math.round(partitionCacheLifetime.getValue()),
                                                            partitionCacheLifetime.getUnit())
                                          .build(partitionLoader);
    }

    private List<HivePartition> queryPartitions(String query)
    {
        final ImmutableList.Builder<HivePartition> cache = ImmutableList.builder();
        final Map<Column, List<Object>> objects = Maps.newHashMap();
        QueryRunner queryRunner = queryRunnerFactory.create();
        QueryClient queryClient = new QueryClient(queryRunner, io.dropwizard.util.Duration.seconds(60), query);

        try {
            queryClient.executeWith(new Function<StatementClient, Void>() {
                @Nullable
                @Override
                public Void apply(StatementClient client)
                {
                    QueryData results = client.currentData();
                    QueryStatusInfo info = client.currentStatusInfo();

                    if (results.getData() != null && info.getColumns() != null) {
                        final List<Column> columns = info.getColumns();

                        for (Column column : columns) {
                            objects.put(column, Lists.newArrayList());
                        }

                        for (List<Object> row : results.getData()) {
                            for (int i = 0; i < row.size(); i++) {
                                Column column = columns.get(i);
                                objects.get(column).add(row.get(i));
                            }
                        }
                    }

                    return null;
                }
            });
        }
        catch (QueryClient.QueryTimeOutException e) {
            log.error("Caught timeout loading columns", e);
        }

        for (Map.Entry<Column, List<Object>> entry : objects.entrySet()) {
            cache.add(HivePartition.fromColumn(entry.getKey(), entry.getValue()));
        }

        return cache.build();
    }

    private List<HiveColumn> queryColumns(String query)
    {
        final ImmutableList.Builder<HiveColumn> cache = ImmutableList.builder();
        QueryRunner queryRunner = queryRunnerFactory.create();
        QueryClient queryClient = new QueryClient(queryRunner, io.dropwizard.util.Duration.seconds(60), query);

        try {
            queryClient.executeWith(new Function<StatementClient, Void>() {
                @Nullable
                @Override
                public Void apply(StatementClient client)
                {
                    QueryResults results = (QueryResults) client.currentStatusInfo();
                    if (results.getData() != null) {
                        for (List<Object> row : results.getData()) {
                            Column column = new Column((String) row.get(0), (String) row.get(1), new ClientTypeSignature(TypeSignature.parseTypeSignature((String)row.get(1))));
                            boolean isNullable  = ConvertUtils.toBoolean(row.get(2));
                            boolean isPartition = ConvertUtils.toBoolean(row.get(3));

                            cache.add(HiveColumn.fromColumn(column, isNullable, isPartition));
                        }
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

    public List<HiveColumn> getColumns(String databaseName, String tableName) throws ExecutionException
    {
        return schemaTableCache.get(Util.fqn(databaseName, tableName));
    }

    public List<HivePartition> getPartitions(String databaseName, String tableName) throws ExecutionException
    {
        return partitionCache.get(Util.fqn(databaseName, tableName));
    }

}
