package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class CSVPersistorFactory
{
    private boolean useS3Persistor = false;
    private ExpiringFileStore expiringFileStore;

    public Persistor getPersistor(Job job, PersistentJobOutput jobOutput)
    {
        if (useS3Persistor) {
            return new S3FilePersistor(null, null, 0L);
        } else {
            return new FlatFilePersistor(expiringFileStore);
        }
    }
}
