package com.airbnb.airpal.core;

import com.airbnb.airpal.api.output.HiveTablePersistentOutput;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.api.output.S3CsvPersistentOutput;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.google.common.base.Strings;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import java.net.URI;
import java.util.List;
import java.util.UUID;

public class PersistentJobOutputFactory
{
    private final AmazonS3 s3Client;
    private final List<URI> corsAllowedHosts;
    private final String s3Bucket;

    @Inject
    public PersistentJobOutputFactory(AmazonS3 s3Client,
                                      @Named("corsAllowedHosts") List<URI> corsAllowedHosts,
                                      @Named("s3Bucket") String s3Bucket)
    {
        this.s3Client = s3Client;
        this.corsAllowedHosts = corsAllowedHosts;
        this.s3Bucket = s3Bucket;
    }

    public PersistentJobOutput create(final String tmpTable,
                                      final UUID jobUUID)
    {
        if (!Strings.isNullOrEmpty(tmpTable)) {
            return new HiveTablePersistentOutput(jobUUID, tmpTable);
        } else {
            return new S3CsvPersistentOutput(jobUUID, s3Client, corsAllowedHosts, s3Bucket);
        }
    }
}
