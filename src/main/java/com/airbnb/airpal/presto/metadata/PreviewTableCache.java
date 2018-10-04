package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.core.BackgroundCacheLoader;
import com.airbnb.airpal.core.execution.QueryClient;
import com.airbnb.airpal.presto.QueryRunner;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.Util;
import com.airbnb.airpal.presto.hive.HivePartition;
import com.facebook.presto.client.QueryData;
import com.facebook.presto.client.QueryResults;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import io.airlift.units.Duration;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nullable;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.String.format;

@Slf4j
public class PreviewTableCache
{
    private final LoadingCache<PartitionedTableWithValue, List<List<Object>>> previewTableCache;
    private final QueryRunner.QueryRunnerFactory queryRunnerFactory;

    public PreviewTableCache(final QueryRunner.QueryRunnerFactory queryRunnerFactory,
                             final Duration previewCacheLifetime,
                             final ExecutorService executor,
                             final int previewLimit)
    {
        this.queryRunnerFactory = checkNotNull(queryRunnerFactory, "queryRunnerFactory session was null!");

        ListeningExecutorService listeningExecutor = MoreExecutors.listeningDecorator(executor);

        BackgroundCacheLoader<PartitionedTableWithValue, List<List<Object>>> tableLoader =
                new BackgroundCacheLoader<PartitionedTableWithValue, List<List<Object>>>(listeningExecutor)
        {
                    @Override
                    public List<List<Object>> load(PartitionedTableWithValue key)
                            throws Exception
                    {
                        return queryRows(buildQueryWithLimit(key, previewLimit));
                    }
        };

        this.previewTableCache = CacheBuilder.newBuilder()
                                            .expireAfterWrite(Math.round(previewCacheLifetime.getValue()),
                                                              previewCacheLifetime.getUnit())
                                            .maximumSize(previewLimit)
                                            .build(tableLoader);
    }

    private static String buildQueryWithLimit(PartitionedTableWithValue tableWithValue, int limit)
    {
        Table table = tableWithValue.getTable();
        HivePartition partition = tableWithValue.getPartition().orNull();
        String partitionClause = "";

        if (partition != null) {
            String value = tableWithValue.getValue();
            String partitionValue = (Objects.equals(partition.getType(), "varchar")) ?
                    "'" + value + "'" :
                    String.valueOf(value);

            partitionClause = format("WHERE %s = %s", partition.getName(), partitionValue);
        }

        return format("SELECT * FROM %s %s LIMIT %d",
                Util.fqn(table.getConnectorId(), table.getSchema(), table.getTable()),
                partitionClause,
                limit);
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
                    QueryData results = client.currentData();
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

    public List<List<Object>> getPreview(final String connectorId,
            final String schema,
            final String table,
            final Optional<HivePartition> partition,
            final String partitionValue)
            throws ExecutionException
    {
        return previewTableCache.get(
                new PartitionedTableWithValue(
                        new Table(connectorId,
                                schema,
                                table),
                        partition,
                        partitionValue
                ));
    }
}
