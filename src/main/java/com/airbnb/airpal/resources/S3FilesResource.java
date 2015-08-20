package com.airbnb.airpal.resources;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.google.common.io.ByteStreams;
import com.google.inject.Inject;
import lombok.val;

import javax.inject.Named;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Path("/api/s3")
public class S3FilesResource
{

    private final AmazonS3 s3Client;
    private final String outputBucket;

    @Inject
    public S3FilesResource(
            AmazonS3 s3Client,
            @Named("s3Bucket") String outputBucket)
    {
        this.s3Client = s3Client;
        this.outputBucket = outputBucket;
    }

    private String getOutputKey(String fileBaseName)
    {
        return "airpal/" + fileBaseName;
    }

    @GET
    @Path("/{filename}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getFile(@PathParam("filename") String filename)
    {
        val outputKey = getOutputKey(filename);
        val getRequest = new GetObjectRequest(outputBucket, outputKey);
        final val object = s3Client.getObject(getRequest);

        if (object == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        } else {
            return Response.ok(new StreamingOutput() {
                @Override
                public void write(OutputStream output)
                        throws IOException, WebApplicationException
                {
                    try (InputStream objectData = object.getObjectContent()) {
                        ByteStreams.copy(objectData, output);

                    } finally {
                        output.close();
                    }
                }
            }).build();
        }
    }
}
