package com.airbnb.airpal.core.store.history;

import com.airbnb.airpal.api.EvictingDeque;
import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingDeque;

public class LocalJobHistoryStore implements JobHistoryStore {

    public static class FinishedJobEvictingDeque extends EvictingDeque<Job> {
        public FinishedJobEvictingDeque(int capacity) {
            super(capacity);
        }

        @Override
        protected boolean evictItem(LinkedBlockingDeque<Job> deque) {
            final Job job = deque.poll();

            if (job != null) {
                if (job.getState().isDone()) {
                    return true;
                } else {
                    boolean addResult = add(job);
                    boolean secondEviction = evictItem(deque);

                    return addResult && secondEviction;
                }
            } else {
                return false;
            }
        }
    }

    private final Cache<Table, EvictingDeque<Job>> tableHistoryCache;
    private final EvictingDeque<Job> historyCache;
    private final int maximumHistoryPerTable;

    public LocalJobHistoryStore(final long maximumTableHistories,
                                final int maximumHistoryPerTable,
                                final long maximumHistoryGeneral)
    {
        this.tableHistoryCache = CacheBuilder.newBuilder()
                                             .maximumSize(maximumTableHistories)
                                             .build();

        this.historyCache = new FinishedJobEvictingDeque((int)maximumHistoryGeneral);

        this.maximumHistoryPerTable = maximumHistoryPerTable;
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults) {
        final ImmutableList.Builder<Job> builder = ImmutableList.builder();
        long added = 0;

        for (Job job : historyCache) {
            if (added + 1 > maxResults)
                break;

            builder.add(job);
            added += 1;
        }

        return builder.build();
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables)
    {
        return getRecentlyRun(maxResults, Lists.asList(table1, otherTables));
    }

    @Override
    public List<Job> getRecentlyRunForUser(String user, long maxResults)
    {
        return null;
    }

    @Override
    public List<Job> getRecentlyRunForUser(String user, long maxResults, Iterable<Table> tables)
    {
        return null;
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Iterable<Table> tables)
    {
        final ImmutableList.Builder<Job> builder = ImmutableList.builder();
        long added = 0;

        for (Map.Entry<Table, EvictingDeque<Job>> entry : tableHistoryCache.getAllPresent(tables).entrySet()) {
            EvictingDeque<Job> deque = entry.getValue();
            if (deque != null) {
                final int dequeSize = deque.size();
                if (added + dequeSize > maxResults) {
                    break;
                } else {
                    builder.addAll(deque);
                    added += dequeSize;
                }
            }
        }

        return builder.build();
    }

    @Override
    public void addRun(Job job) {
        historyCache.add(job);

        for (Table usedTable : job.getTablesUsed()) {
            EvictingDeque<Job> tableCache = tableHistoryCache.getIfPresent(usedTable);

            if (tableCache == null) {
                tableCache = new FinishedJobEvictingDeque(maximumHistoryPerTable);
                tableHistoryCache.put(usedTable, tableCache);
            }

            tableCache.add(job);
        }
    }
}
