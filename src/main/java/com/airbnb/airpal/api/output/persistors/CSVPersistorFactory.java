package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.amazonaws.services.s3.AmazonS3;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class CSVPersistorFactory
{
    private boolean useS3Persistor = false;
    private AmazonS3 s3Client;
    private String s3Bucket;
    private ExpiringFileStore expiringFileStore;

    public Persistor getPersistor(Job job, PersistentJobOutput jobOutput)
    {
        // TODO: Support variable CSV persistor.
        if (useS3Persistor) {
            return new S3FilePersistor(s3Client, s3Bucket, 0L);
        } else {
            return new FlatFilePersistor(expiringFileStore);
        }
    }
}
