package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PersistorFactory
{
    private final CSVPersistorFactory csvPersistorFactory;

    public Persistor getPersistor(Job job, PersistentJobOutput jobOutput)
    {
        switch (jobOutput.getType()) {
            case "csv":
                return csvPersistorFactory.getPersistor(job, jobOutput);
            case "hive":
                return new HiveTablePersistor(jobOutput);
            default:
                throw new IllegalArgumentException();
        }
    }
}
