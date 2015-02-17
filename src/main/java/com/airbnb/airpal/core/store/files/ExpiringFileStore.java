package com.airbnb.airpal.core.store.files;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.cache.RemovalListener;
import com.google.common.cache.RemovalNotification;
import com.google.common.cache.Weigher;
import io.airlift.units.DataSize;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.concurrent.ExecutionException;

@Slf4j
public class ExpiringFileStore
{
    private LoadingCache<String, FileWithMetadata> fileWithMetadataCache;
    private File basePath = new File(System.getProperty("java.io.tmpdir"));

    public ExpiringFileStore(DataSize maxStorageSize)
    {
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
        }).build(new CacheLoader<String, FileWithMetadata>() {
            @Override
            public FileWithMetadata load(String key)
                    throws Exception
            {
                File file = new File(basePath, key);
                if (file.exists()) {
                    return new FileWithMetadata(file, new DataSize(file.length(), DataSize.Unit.BYTE), DateTime.now());
                }

                throw new FileNotFoundException();
            }
        });
    }

    public void addFile(String key, File file)
            throws IOException
    {
        long fileSize = file.length();
        fileWithMetadataCache.put(key, new FileWithMetadata(file, new DataSize(fileSize, DataSize.Unit.BYTE), DateTime.now()));
    }

    public File get(String key)
    {
        try {
            return fileWithMetadataCache.get(key).getFile();
        }
        catch (ExecutionException e) {
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
