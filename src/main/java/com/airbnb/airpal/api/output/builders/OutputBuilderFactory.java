package com.airbnb.airpal.api.output.builders;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

import static java.lang.String.format;

@RequiredArgsConstructor
public class OutputBuilderFactory
{
    private final long maxFileSizeBytes;

    public JobOutputBuilder forJob(Job job)
            throws IOException
    {
        PersistentJobOutput output = job.getOutput();
        switch (output.getType()) {
            case "csv":
                return new CsvOutputBuilder(true, job.getUuid(), maxFileSizeBytes);
            case "hive":
                return new HiveTableOutputBuilder(job.getOutput().getLocation().toString().split(".")[1]);
            default:
                throw new IllegalArgumentException(format("OutputBuilder for type %s not found", output.getType()));
        }
    }
}
