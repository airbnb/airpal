package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.builders.JobOutputBuilder;
import com.airbnb.airpal.core.execution.ExecutionClient;
import com.airbnb.airpal.core.execution.QueryExecutionAuthorizer;
import com.amazonaws.AmazonClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.google.common.net.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.val;

import javax.ws.rs.core.UriBuilder;
import java.io.File;
import java.net.URI;

import static com.google.common.base.Preconditions.checkNotNull;

@RequiredArgsConstructor
public class S3FilePersistor
        implements Persistor
{
    private final AmazonS3 s3Client;
    private final String outputBucket;
    private final long maxSizeForTextView;

    @Override
    public boolean canPersist(QueryExecutionAuthorizer authorizer)
    {
        // Everyone can write to s3
        return true;
    }

    private String getOutputKey(String fileBaseName)
    {
        return "airpal/" + fileBaseName;
    }

    @Override
    public URI persist(JobOutputBuilder outputBuilder, Job job)
    {
        File file = checkNotNull(outputBuilder.build(), "output builder resulting file was null");

        val objectMetaData = new ObjectMetadata();
        objectMetaData.setContentLength(file.length());
        objectMetaData.setContentType(MediaType.CSV_UTF_8.toString());

        val putRequest = new PutObjectRequest(
                outputBucket,
                getOutputKey(file.getName()),
                file
        ).withMetadata(objectMetaData);

        try {
            s3Client.putObject(putRequest);
            return UriBuilder.fromPath("/api/s3/{filename}").build(file.getName());
        }
        catch (AmazonClientException e) {
            throw new ExecutionClient.ExecutionFailureException(job, "Could not upload CSV to S3", e);
        }
        finally {
            outputBuilder.delete();
        }
    }
}
