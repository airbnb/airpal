package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.core.ManagedESClient;
import com.airbnb.airpal.core.store.UsageStore;
import com.airbnb.airpal.presto.Table;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.ForwardingLoadingCache;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableMap;
import io.dropwizard.util.Duration;
import org.elasticsearch.indices.IndexMissingException;

import java.util.Map;
import java.util.concurrent.ExecutionException;

public class CachingESUsageStore implements UsageStore
{
    private final ESUsageStore delegateStore;
    private final LoadingCache<Table, Long> cache;

    public static class BulkOptimizedLoadingCache<K, V> extends ForwardingLoadingCache<K, V>
    {
        private final LoadingCache<K, V> delegate;
        private final CacheLoader<Iterable<? extends K>, ImmutableMap<K, V>> bulkLoader;

        public BulkOptimizedLoadingCache(LoadingCache<K, V> loadingCache,
                                         CacheLoader<Iterable<? extends K>, ImmutableMap<K, V>> bulkLoader)
        {
            this.delegate = loadingCache;
            this.bulkLoader = bulkLoader;
        }

        @Override
        protected LoadingCache<K, V> delegate() {
            return delegate;
        }

        @Override
        public ImmutableMap<K, V> getAll(Iterable<? extends K> keys) throws ExecutionException
        {
            try {
                ImmutableMap<K, V> results = bulkLoader.load(keys);
                delegate.putAll(results);
                return results;
            } catch (Exception e) {
                e.printStackTrace();
            }

            return ImmutableMap.of();
        }
    }

    public CachingESUsageStore(ManagedESClient managedNode,
                               Duration duration,
                               Duration cacheDuration)
    {
        this.delegateStore = new ESUsageStore(managedNode, duration);

        LoadingCache<Table, Long> baseCache = CacheBuilder.newBuilder()
                                                          .expireAfterWrite(cacheDuration.getQuantity(),
                                                                            cacheDuration.getUnit())
                                                          .build(new CacheLoader<Table, Long>() {
                                                              @Override
                                                              public Long load(Table key) throws Exception {
                                                                  return delegateStore.getUsages(key);
                                                              }
                                                          });
        this.cache = new BulkOptimizedLoadingCache<>(
                baseCache,
                new CacheLoader<Iterable<? extends Table>, ImmutableMap<Table, Long>>()
                {
                    @Override
                    public ImmutableMap<Table, Long> load(Iterable<? extends Table> keys) throws Exception {
                        return ImmutableMap.copyOf(delegateStore.getUsages((Iterable<Table>) keys));
                    }
                });
    }


    @Override
    public long getUsages(Table table)
    {
        try {
            return cache.get(table);
        } catch (ExecutionException e) {
            return 0;
        }
    }

    @Override
    public Map<Table, Long> getUsages(Iterable<Table> tables) {
        try {
            return cache.getAll(tables);
        } catch (ExecutionException | IndexMissingException e) {
            return ImmutableMap.of();
        }
    }

    @Override
    public void markUsage(Table table)
    {
        delegateStore.markUsage(table);
    }

    @Override
    public Duration window()
    {
        return delegateStore.window();
    }
}
