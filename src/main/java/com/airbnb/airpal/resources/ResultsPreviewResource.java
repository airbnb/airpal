package com.airbnb.airpal.resources;

import com.opencsv.CSVReader;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Inject;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.AmazonS3;

import javax.inject.Named;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.net.URI;

@Slf4j
@Path("/api/preview")
public class ResultsPreviewResource
{
    private final ExpiringFileStore fileStore;
    private final AmazonS3 s3Client;
    private final String outputBucket;

    @Inject
    public ResultsPreviewResource(
            ExpiringFileStore fileStore,
            AmazonS3 s3Client,
            @Named("s3Bucket") String outputBucket)
    {
        this.fileStore = fileStore;
        this.s3Client = s3Client;
        this.outputBucket = outputBucket;
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFile(@QueryParam("fileURI") URI fileURI,
                            @DefaultValue("100") @QueryParam("lines") int numLines)
    {
        if (fileURI.getPath().startsWith("/api/s3")) {
            return getS3Preview(fileURI, numLines);
        } else {
            return getFilePreview(fileURI, numLines);
        }
    }

    private String getOutputKey(String fileBaseName)
    {
        return "airpal/" + fileBaseName;
    }

    private String getFilename(URI fileURI)
    {
        return fileURI.getPath().substring(fileURI.getPath().lastIndexOf('/') + 1);
    }

    private Response getS3Preview(URI fileURI, int numLines) {
        val filename = getFilename(fileURI);
        val outputKey = getOutputKey(filename);
        // download ~100 kb (depending on your definition) of the file
        val request = new GetObjectRequest(
                outputBucket,
                outputKey
        ).withRange(0, 100 * 1024);
        val object = s3Client.getObject(request);
        try (val s3Reader = new CSVReader(new BufferedReader(new InputStreamReader(object.getObjectContent())))) {
            return getPreviewFromCSV(s3Reader, numLines);
        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Response getPreviewFromCSV(CSVReader reader, final int numLines) {
        List<Map<String, String>> columns = new ArrayList<>();
        List<List<String>> rows = new ArrayList<>();
        try {
            for (final String columnName: reader.readNext()) {
                columns.add(new HashMap<String, String>(){{
                    put("name", columnName);
                }});
            }
            int counter = 0;
            for (String[] line : reader) {
                counter++;
                rows.add(Arrays.asList(line));
                if (counter >= numLines) {
                  break;
                }
            }
        } catch (IOException e) {
            log.error(e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
        return Response.ok(new PreviewResponse(columns, rows)).build();
    }

    private Response getFilePreview(URI fileURI, int numLines) {
        String fileName = getFilename(fileURI);
        final File file = fileStore.get(fileName);
        try {
            if (file == null) {
                throw new FileNotFoundException(fileName + " could not be found");
            }
            try (final CSVReader reader = new CSVReader(new FileReader(file))) {
              return getPreviewFromCSV(reader, numLines);
            } catch (IOException e) {
              return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        } catch (FileNotFoundException e) {
            log.warn(e.getMessage());
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }


    @Data
    private static class PreviewResponse
    {
        @JsonProperty
        private final List<Map<String, String>> columns;

        @JsonProperty
        private final List<List<String>> data;
    }
}
