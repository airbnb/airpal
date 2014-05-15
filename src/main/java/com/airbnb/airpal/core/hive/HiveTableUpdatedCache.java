package com.airbnb.airpal.core.hive;

import com.airbnb.airpal.core.BackgroundCacheLoader;
import com.airbnb.airpal.core.TableUpdatedCache;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.Table;
import com.google.common.base.Function;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.ForwardingLoadingCache;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.common.util.concurrent.RateLimiter;
import io.dropwizard.util.Duration;
import org.joda.time.DateTime;

import javax.annotation.Nullable;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

public class HiveTableUpdatedCache implements TableUpdatedCache
{
    public static final int MIN_CACHE_SIZE = 5;
    private static String UPDATED_QUERY = "SELECT " +
            "TBLS.CREATE_TIME AS table_create_time, TBLS.TBL_NAME AS table_name, DBS.NAME AS db_name, " +
            "PARTITIONS.CREATE_TIME as partition_create_time, PARTITIONS.PART_NAME as partition_name " +
            "FROM TBLS " +
            "JOIN DBS ON TBLS.DB_ID = DBS.DB_ID " +
            "LEFT OUTER JOIN PARTITIONS ON PARTITIONS.TBL_ID = TBLS.TBL_ID";

    private final String connectionUrl;
    private final String connectionUserName;
    private final String connectionPassword;
    private final LoadingCache<PartitionedTable, DateTime> updatedAtCache;

    public HiveTableUpdatedCache(Duration cacheTime,
                                 String connectionDriver,
                                 String connectionUrl,
                                 String connectionUserName,
                                 String connectionPassword,
                                 final ExecutorService executorService)
    {
        try {
            Class.forName(connectionDriver);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            System.out.println("Could not load MetaStore's ConnectionDriver");
        }

        this.connectionUrl = connectionUrl;
        this.connectionUserName = connectionUserName;
        this.connectionPassword = connectionPassword;

        ListeningExecutorService listeningExecutorService = MoreExecutors.listeningDecorator(executorService);

        final LoadingCache<PartitionedTable, DateTime> baseCache = CacheBuilder
                .newBuilder()
                .expireAfterWrite(
                        cacheTime.getQuantity(), cacheTime.getUnit())
                .build(new BackgroundCacheLoader<PartitionedTable, DateTime>(listeningExecutorService)
                {
                    @Override
                    public DateTime load(PartitionedTable key) throws Exception
                    {
                        return loadCreatedAt(ImmutableList.of(key)).get(key);
                    }
                });

        this.updatedAtCache = new UpdatedLoadingCache(cacheTime,
                                                      baseCache,
                                                      executorService,
                                                      new Function<Object, Map<PartitionedTable, DateTime>>()
                                                      {
                                                          @Nullable
                                                          @Override
                                                          public Map<PartitionedTable,
                                                                  DateTime> apply(@Nullable Object input)
                                                          {
                                                              return loadFromMetaStore();
                                                          }
                                                      });
    }

    private Map<PartitionedTable, DateTime> loadFromMetaStore()
    {
        ImmutableMap.Builder<PartitionedTable, DateTime> builder = ImmutableMap.builder();

        try (Connection connection = DriverManager.getConnection(connectionUrl, connectionUserName,
                                                                 connectionPassword)) {
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(UPDATED_QUERY);

            while (resultSet.next()) {
                int createTime = resultSet.getInt(1);
                String tableName = resultSet.getString(2);
                String schemaName = resultSet.getString(3);
                int partitionCreateTime = resultSet.getInt(4);
                String partitionName = resultSet.getString(5);
                DateTime createdAt = null;
                PartitionedTable partitionedTable = new PartitionedTable("hive",
                                                                         schemaName,
                                                                         tableName,
                                                                         partitionName);

                if (partitionName != null) {
                    createdAt = new DateTime(partitionCreateTime * 1000L);
                } else {
                    createdAt = new DateTime(createTime * 1000L);
                }

                builder.put(partitionedTable, createdAt);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return builder.build();
    }

    private Map<PartitionedTable, DateTime> loadCreatedAt(
            final Iterable<? extends PartitionedTable> tableNames)
            throws Exception
    {
        return loadFromMetaStore();
    }

    public DateTime get(Table table)
    {
        PartitionedTable partTable = null;

        if (table instanceof PartitionedTable) {
            partTable = (PartitionedTable) table;
        } else {
            partTable = new PartitionedTable(table.getConnectorId(),
                                             table.getSchema(),
                                             table.getTable());
        }

        return updatedAtCache.getIfPresent(partTable);
    }

    public Map<PartitionedTable, DateTime> getAllPresent(List<? extends Table> tables)
    {
        ImmutableList.Builder<PartitionedTable> builder = ImmutableList.builder();

        for (Table table : tables) {
            if (table instanceof PartitionedTable) {
                builder.add((PartitionedTable) table);
            } else {
                builder.add(new PartitionedTable(table.getConnectorId(), table.getSchema(), table.getTable()));
            }
        }

        return getAllFromPartitionedTables(builder.build());
    }

    private Map<PartitionedTable, DateTime> getAllFromPartitionedTables(List<PartitionedTable> tables)
    {
        return updatedAtCache.getAllPresent(tables);
    }

    public Map<PartitionedTable, DateTime> getAll(List<Table> tables)
    {
        ImmutableList.Builder<PartitionedTable> builder = ImmutableList.builder();

        for (Table table : tables) {
            builder.add(new PartitionedTable(table.getConnectorId(), table.getSchema(), table.getTable()));
        }

        ImmutableMap<PartitionedTable, DateTime> result = null;

        try {
            result = updatedAtCache.getAll(builder.build());
        } catch (ExecutionException e) {
            e.printStackTrace();

            return Collections.emptyMap();
        }

        return result;
    }

    public void refreshAll(List<PartitionedTable> tableNames)
    {
        for (PartitionedTable tableName : tableNames) {
            updatedAtCache.refresh(tableName);
        }
    }

    private void reloadCache(PartitionedTable tableName) throws Exception
    {
    }

    public static class UpdatedLoadingCache extends ForwardingLoadingCache<PartitionedTable, DateTime>
    {
        private final RateLimiter rateLimiter;
        private final LoadingCache<PartitionedTable, DateTime> baseCache;
        private final ExecutorService executorService;
        private final Function<Object, Map<PartitionedTable, DateTime>> runnableFunction;

        public UpdatedLoadingCache(Duration intervalPeriod,
                                   LoadingCache<PartitionedTable, DateTime> baseCache,
                                   ExecutorService executorService,
                                   Function<Object, Map<PartitionedTable, DateTime>> runnableFunction)
        {
            double period = 1.0d / ((double) intervalPeriod.toSeconds());
            this.rateLimiter = RateLimiter.create(period);
            this.baseCache = baseCache;
            this.executorService = executorService;
            this.runnableFunction = runnableFunction;
        }

        @Override
        protected LoadingCache<PartitionedTable, DateTime> delegate()
        {
            return baseCache;
        }

        protected void reload()
        {
            executorService.submit(new Runnable()
            {
                @Override
                public void run()
                {
                    if (rateLimiter.tryAcquire()) {
                        putAll(runnableFunction.apply(this));
                    }
                }
            });
        }

        @Nullable
        @Override
        public DateTime getIfPresent(Object key)
        {
            DateTime superResult = super.getIfPresent(key);

            if (superResult == null) {
                try {
                    getAll(Collections.<PartitionedTable>emptyList());
                } catch (ExecutionException e) {
                    e.printStackTrace();
                }
            }

            return super.getIfPresent(key);
        }

        @Override
        public ImmutableMap<PartitionedTable, DateTime> getAll(Iterable<? extends PartitionedTable> keys)
                throws ExecutionException
        {
            try {
                reload();
                return getAllPresent(keys);
            } catch (Exception e) {
                e.printStackTrace();
                return ImmutableMap.of();
            }
        }

        @Override
        public ImmutableMap<PartitionedTable, DateTime> getAllPresent(Iterable<?> keys)
        {
            ImmutableMap<PartitionedTable, DateTime> result = super.getAllPresent(keys);

            if (result.size() < 1) {
                this.reload();
            }

            return result;
        }
    }
}
