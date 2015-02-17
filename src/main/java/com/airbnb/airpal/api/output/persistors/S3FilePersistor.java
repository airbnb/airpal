package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.builders.JobOutputBuilder;
import com.airbnb.airpal.core.execution.ExecutionClient;
import com.airbnb.airpal.core.execution.QueryExecutionAuthorizer;
import com.amazonaws.AmazonClientException;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.google.common.net.MediaType;
import io.dropwizard.util.Duration;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Date;

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

    private long getExpirationWindow()
    {
        return (new Date()).getTime() + Duration.days(365).toMilliseconds();
    }

    @Override
    public URI persist(JobOutputBuilder outputBuilder, Job job)
    {
        File file = checkNotNull(outputBuilder.build(), "output builder resulting file was null");

        final String outputKey = getOutputKey(file.getName());
        final Date expirationDate = new Date(getExpirationWindow());
        final long fileSize = file.length();
        final ObjectMetadata objectMetaData = new ObjectMetadata();
        objectMetaData.setContentLength(fileSize);

        if (fileSize <= maxSizeForTextView) {
            objectMetaData.setContentType(MediaType.PLAIN_TEXT_UTF_8.toString());
        } else {
            objectMetaData.setContentType(MediaType.CSV_UTF_8.toString());
        }

        PutObjectRequest putRequest = new PutObjectRequest(outputBucket,
                outputKey,
                file).withMetadata(objectMetaData);
        final GeneratePresignedUrlRequest presignedUrlRequest = new GeneratePresignedUrlRequest(
                outputBucket,
                outputKey,
                HttpMethod.GET).withExpiration(expirationDate);

        try {
            s3Client.putObject(putRequest);
            URL generatedURL = s3Client.generatePresignedUrl(presignedUrlRequest);
            return generatedURL.toURI();
        }
        catch (AmazonClientException e) {
            throw new ExecutionClient.ExecutionFailureException(
                    job,
                    "Could not upload CSV to S3",
                    e);
        }
        catch (URISyntaxException e) {
            e.printStackTrace();
            throw new ExecutionClient.ExecutionFailureException(
                    job,
                    "Could not generate presigned URL for CSV",
                    e);
        }
        finally {
            outputBuilder.delete();
        }
    }
}
