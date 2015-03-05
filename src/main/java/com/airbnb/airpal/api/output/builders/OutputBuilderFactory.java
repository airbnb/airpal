package com.airbnb.airpal.api.output.builders;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.HiveTablePersistentOutput;
import com.airbnb.airpal.api.output.InvalidQueryException;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.net.URI;

import static java.lang.String.format;

@RequiredArgsConstructor
public class OutputBuilderFactory
{
    private final long maxFileSizeBytes;

    public JobOutputBuilder forJob(Job job)
            throws IOException, InvalidQueryException
    {
        PersistentJobOutput output = job.getOutput();
        switch (output.getType()) {
            case "csv":
                return new CsvOutputBuilder(true, job.getUuid(), maxFileSizeBytes);
            case "hive":
                HiveTablePersistentOutput hiveOutput = (HiveTablePersistentOutput) output;
                URI location = output.getLocation();
                if (location == null) {
                    throw new InvalidQueryException(format("Invalid table name '%s'", hiveOutput.getTmpTableName()));
                }
                return new HiveTableOutputBuilder(hiveOutput.getDestinationSchema(), hiveOutput.getTmpTableName());
            default:
                throw new IllegalArgumentException(format("OutputBuilder for type %s not found", output.getType()));
        }
    }
}
