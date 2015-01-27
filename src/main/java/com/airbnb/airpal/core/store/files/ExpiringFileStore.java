package com.airbnb.airpal.core.store.files;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;
import com.google.common.cache.RemovalNotification;
import com.google.common.cache.Weigher;
import com.google.common.collect.ImmutableMap;
import io.airlift.units.DataSize;
import io.dropwizard.lifecycle.Managed;
import lombok.Value;
import org.joda.time.DateTime;
import org.joda.time.Duration;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.google.common.base.Preconditions.checkNotNull;

public class ExpiringFileStore implements Managed, Runnable
{
    private Duration cleanupDelay = new Duration(1_000 * 60);
    private ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    private Cache<String, FileWithMetadata> fileWithMetadataCache;

    public ExpiringFileStore(DataSize maxStorageSize, Duration maxStorageTime, Duration cleanupDelay)
    {
        this.cleanupDelay = checkNotNull(cleanupDelay, "cleanupDelay was null");

        long maxWeightInBytes = Math.round(Math.floor(maxStorageSize.getValue(DataSize.Unit.BYTE)));
        this.fileWithMetadataCache = CacheBuilder.newBuilder().maximumWeight(maxWeightInBytes).weigher(new Weigher<String, FileWithMetadata>() {
            @Override
            public int weigh(String key, FileWithMetadata fileWithMetadata)
            {
                return (int) Math.round(fileWithMetadata.getSize().getValue(DataSize.Unit.BYTE));
            }
        }).removalListener(new RemovalListener<String, FileWithMetadata>() {
            @Override
            public void onRemoval(RemovalNotification<String, FileWithMetadata> notification)
            {
                File f = notification.getValue().getFile();
                if (f != null && f.exists()) {
                    f.delete();
                }
            }
        }).build();
    }

    @Override
    public void start()
            throws Exception
    {
        executorService.scheduleWithFixedDelay(this, 0, cleanupDelay.getStandardSeconds(), TimeUnit.SECONDS);
    }

    @Override
    public void stop()
            throws Exception
    {
        executorService.shutdown();
    }

    @Override
    public void run()
    {
        // Do cleanup
        Set<String> keysToRemove = new HashSet<>();
        Map<String, FileWithMetadata> fileMap = ImmutableMap.copyOf(fileWithMetadataCache.asMap());
        for (Map.Entry<String, FileWithMetadata> entry : fileMap.entrySet()) {
            FileWithMetadata fileWithMetadata = entry.getValue();
            String key = entry.getKey();

//            if (fileWithMetadata.getSize().compareTo(maxStorageSize) > 0) {
//                fileWithMetadataCache.invalidate(key);
//            }
        }
    }

    public void addFile(String key, File file)
            throws IOException
    {
        long fileSize = file.length();
        fileWithMetadataCache.put(key, new FileWithMetadata(file, new DataSize(fileSize, DataSize.Unit.BYTE), DateTime.now()));
    }

    public File get(String key)
    {
        FileWithMetadata fileWithMetadata = fileWithMetadataCache.getIfPresent(key);

        if (fileWithMetadata != null) {
            return fileWithMetadata.getFile();
        } else {
            return null;
        }
    }

    @Value
    private static class FileWithMetadata
    {
        private final File file;
        private final DataSize size;
        private final DateTime createdAt;
    }
}
