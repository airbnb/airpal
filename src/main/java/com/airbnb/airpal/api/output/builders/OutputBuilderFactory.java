package com.airbnb.airpal.api.output.builders;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

import static java.lang.String.format;

@RequiredArgsConstructor
public class OutputBuilderFactory
{
    private static final Splitter TABLE_SPLITTER = Splitter.on(".").omitEmptyStrings();

    private final long maxFileSizeBytes;

    public JobOutputBuilder forJob(Job job)
            throws IOException
    {
        PersistentJobOutput output = job.getOutput();
        switch (output.getType()) {
            case "csv":
                return new CsvOutputBuilder(true, job.getUuid(), maxFileSizeBytes);
            case "hive":
                return new HiveTableOutputBuilder(
                        Iterables.getLast(TABLE_SPLITTER.splitToList(job.getOutput().getLocation().toString())));
            default:
                throw new IllegalArgumentException(format("OutputBuilder for type %s not found", output.getType()));
        }
    }
}
