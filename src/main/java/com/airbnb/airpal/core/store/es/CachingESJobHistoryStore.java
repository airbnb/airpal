package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.core.ManagedNode;
import com.airbnb.airpal.core.store.JobHistoryStore;
import com.airbnb.airpal.presto.Table;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import io.dropwizard.util.Duration;

import java.util.List;
import java.util.concurrent.ExecutionException;

/**
 * Author: @andykram
 */
public class CachingESJobHistoryStore implements JobHistoryStore
{
    private final ESJobHistoryStore delegateStore;
    private final LoadingCache<Table, Iterable<Job>> delegateCache;

    public CachingESJobHistoryStore(ManagedNode managedNode,
                                    ObjectMapper objectMapper,
                                    Duration cacheTime)
    {
        this.delegateStore = new ESJobHistoryStore(managedNode, objectMapper);
        this.delegateCache = CacheBuilder
                .newBuilder()
                .expireAfterWrite(cacheTime.getQuantity(), cacheTime.getUnit())
                .build(new CacheLoader<Table, Iterable<Job>>() {
                    @Override
                    public Iterable<Job> load(Table key) throws Exception {
                        return delegateStore.getRecentlyRun(key);
                    }
                });
    }
    @Override
    public List<Job> getRecentlyRun()
    {
        return getRecentlyRun(1000);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults)
    {
        final ImmutableList.Builder<Job> builder = ImmutableList.builder();
        long added = 0;

        for (Iterable<Job> jobs : delegateCache.asMap().values()) {
            for (Job job : jobs) {
                if (added + 1 > maxResults)
                    break;

                builder.add(job);
                added += 1;
            }

            if (added >= maxResults)
                break;
        }

        return builder.build();
    }

    @Override
    public List<Job> getRecentlyRun(Table table1, Table... otherTables)
    {
        return getRecentlyRun(1000, table1, otherTables);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables)
    {
        final ImmutableList.Builder<Job> builder = ImmutableList.builder();
        final List<Table> tables = Lists.asList(table1, otherTables);
        long added = 0;

        try {
            for (Iterable<Job> jobs : delegateCache.getAll(tables).values()) {
                for (Job job : jobs) {
                    if (added + 1 > maxResults)
                        break;

                    builder.add(job);
                    added += 1;
                }

                if (added >= maxResults)
                    break;
            }
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

        return builder.build();
    }

    @Override
    public void addRun(Job job)
    {
        delegateStore.addRun(job);
    }
}
