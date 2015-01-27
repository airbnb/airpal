package com.airbnb.airpal.core.store.usage;

import com.airbnb.airpal.presto.Table;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Iterables;
import io.dropwizard.util.Duration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class CachingUsageStore implements UsageStore
{
    private final UsageStore delegate;
    private final LoadingCache<Table, Long> cache;

    public CachingUsageStore(final UsageStore delegate, final Duration expireAfter)
    {
        this.delegate = delegate;
        this.cache = CacheBuilder
                .newBuilder()
                .expireAfterWrite(expireAfter.getQuantity(), expireAfter.getUnit())
                .build(new CacheLoader<Table, Long>()
                {
                    @Override
                    public Long load(Table table)
                            throws Exception
                    {
                        return delegate.getUsages(table);
                    }
                });
    }

    @Override
    public long getUsages(Table table)
    {
        try {
            return cache.get(table);
        }
        catch (ExecutionException e) {
            return 0;
        }
    }

    @Override
    public Map<Table, Long> getUsages(Iterable<Table> tables)
    {
        Map<Table, Long> usages = new HashMap<>(Iterables.size(tables));
        for (Table table : tables) {
            usages.put(table, getUsages(table));
        }

        return usages;
    }

    @Override
    public void markUsage(Table table)
    {
        delegate.markUsage(table);
    }

    @Override
    public Duration window()
    {
        return delegate.window();
    }
}
