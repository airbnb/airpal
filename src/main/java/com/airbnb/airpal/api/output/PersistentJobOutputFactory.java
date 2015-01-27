package com.airbnb.airpal.api.output;

import com.amazonaws.services.s3.AmazonS3;
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
            return new CSVPersistentOutput(null, "csv", null);
        }
    }

    public static PersistentJobOutput create(String type, String description, URI location)
    {
        if (location == null) {
            return null;
        } else if (location.isAbsolute()) {
            return new CSVPersistentOutput(location, type, description);
        } else {
            return new HiveTablePersistentOutput(location, type, description);
        }
    }
}
