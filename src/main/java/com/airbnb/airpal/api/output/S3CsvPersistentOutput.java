package com.airbnb.airpal.api.output;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.builders.CsvOutputBuilder;
import com.airbnb.airpal.api.output.builders.JobOutputBuilder;
import com.airbnb.airpal.core.Persistor;
import com.airbnb.airpal.core.execution.ExecutionAuthorizer;
import com.amazonaws.AmazonClientException;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.facebook.presto.client.Column;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import com.google.common.net.MediaType;
import io.dropwizard.util.Duration;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static com.airbnb.airpal.core.execution.ExecutionClient.ExecutionFailureException;

/**
 * Author: @andykram
 */
@RequiredArgsConstructor
@JsonTypeName("csv")
public class S3CsvPersistentOutput implements PersistentJobOutput
{
    public static final long MAX_RAW_FILE_SIZE = 2_000L;
    private final UUID jobUUID;
    private final AmazonS3 s3Client;
    private final List<URI> corsAllowedHosts;
    private final String outputBucket;

    @Getter
    private URI location;

    @JsonCreator
    public S3CsvPersistentOutput(@JsonProperty("location") URI location,
                                 @JsonProperty("type") String type,
                                 @JsonProperty("description") String description)
    {
        this.jobUUID = null;
        this.s3Client = null;
        this.location = location;
        this.corsAllowedHosts = null;
        this.outputBucket = null;
    }

    @Override
    public String getType()
    {
        return "csv";
    }

    @Override
    public String getDescription()
    {
        return null;
    }

    private static Joiner CORS_HOSTS_JOINER = Joiner.on(" ").skipNulls();

    public void persist(final JobOutputBuilder builder, final Job job)
    {
        List<File> files = Lists.newArrayList(builder.build());

        if (files == null || files.size() != 1)
            return;

        File file = files.get(0);

        final String outputBucket = getOutputBucket();
        final String outputKey = getOutputKey(file.getName());
        final Date expirationDate = new Date(getExpirationWindow());
        final long fileSize = file.length();
        final ObjectMetadata objectMetaData = new ObjectMetadata();
        objectMetaData.setContentLength(fileSize);
        objectMetaData.setHeader("Access-Control-Allow-Origin", CORS_HOSTS_JOINER.join(corsAllowedHosts));

        if (fileSize <= MAX_RAW_FILE_SIZE) {
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
            location = generatedURL.toURI();
        }
        catch (AmazonClientException e) {
            throw new ExecutionFailureException(
                    job,
                    "Could not upload CSV to S3",
                    e);
        }
        catch (URISyntaxException e) {
            e.printStackTrace();
            throw new ExecutionFailureException(
                    job,
                    "Could not generate presigned URL for CSV",
                    e);
        }
    }

    private String getOutputBucket() {
        return outputBucket;
    }

    private String getOutputKey(String fileBaseName) {
        return "andykram/airpal/" + fileBaseName;
    }

    private long getExpirationWindow() {
        return (new Date()).getTime() + Duration.days(365).toMilliseconds();
    }

    @Override
    public String processQuery(String query)
    {
        return query;
    }

    @Override
    public Persistor getPersistor(final Job job)
    {
        final S3CsvPersistentOutput t = this;
        final CsvOutputBuilder builder;
        try {
            builder = new CsvOutputBuilder(true, jobUUID);
        }
        catch (IOException e) {
            e.printStackTrace();
            throw new ExecutionFailureException(
                    job,
                    "Could not create CSV",
                    e);
        }

        return new Persistor()
        {
            AtomicBoolean setColumn = new AtomicBoolean(false);

            @Override
            public void onColumns(List<Column> columns)
            {
                if (setColumn.compareAndSet(false, true)) {
                    builder.addColumns(columns);
                }
            }

            @Override
            public void onData(Iterable<List<Object>> data)
            {
                for (List<Object> row : data) {
                    builder.addRow(row);
                }
            }

            @Override
            public void persist()
            {
                t.persist(builder, job);
            }

            @Override
            public boolean canPersist(ExecutionAuthorizer authorizer)
            {
                return true;
            }
        };
    }
}