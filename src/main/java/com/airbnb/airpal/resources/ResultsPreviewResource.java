package com.airbnb.airpal.resources;

import au.com.bytecode.opencsv.CSVReader;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.airbnb.airpal.modules.AirpalModule;
import com.fasterxml.jackson.annotation.JsonProperty; import com.google.inject.Inject;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
import java.io.BufferedReader;
import java.lang.StringBuilder;
import java.lang.IllegalArgumentException;
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

    @Inject
    public ResultsPreviewResource(ExpiringFileStore fileStore, AmazonS3 s3Client)
    {
        this.fileStore = fileStore;
        this.s3Client = s3Client;
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFile(@QueryParam("fileURI") URI fileURI,
                            @DefaultValue("100") @QueryParam("lines") int numLines)
    {
        if (fileURI.isAbsolute() || true) {
            // assume s3
            return getAbsolutePreview(fileURI, numLines);
        } else {
            // assume local fs
            return getRelativePreview(fileURI, numLines);
        }
    }

    private Response getAbsolutePreview(URI fileURI, int numLines) {
        final int lines = numLines;
        AmazonS3URI s3URI;
        try {
          s3URI = new AmazonS3URI(fileURI);
        } catch (IllegalArgumentException e) {
          return Response.status(Response.Status.NOT_FOUND).build();
        }
        GetObjectRequest request =
                new GetObjectRequest(s3URI.getBucket(), s3URI.getKey());
        // download ~100 kb (depending on your definition) of the file
        request.withRange(0, 100000);
        S3Object s3Object = this.s3Client.getObject(request);
        CSVReader s3Reader =
            new CSVReader(new BufferedReader(new InputStreamReader(s3Object.getObjectContent())));
        return getPreviewFromCSV(s3Reader, lines);

    }

    private Response getPreviewFromCSV(CSVReader reader, final int lines) {
        List<Map<String, String>> columns = new ArrayList<>();
        List<List<String>> rows = new ArrayList<>();
        try {
            for (final String columnName: reader.readNext()) {
                columns.add(new HashMap<String, String>(){{
                    put("name", columnName);
                }});
            }
            String[] currentLine = reader.readNext();
            for (int line = 0; line < lines && currentLine != null; line++) {
                rows.add(Arrays.asList(currentLine));
                currentLine = reader.readNext();
            }
        } catch (IOException e) {
            log.error(e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
        return Response.ok(new PreviewResponse(columns, rows)).build();
    }

    private Response getRelativePreview(URI fileURI, int numLines) {
        String fileName = fileURI.toString().split("/")[3];
        final File file = fileStore.get(fileName);
        final int lines = numLines;
        try {
            if (file == null) {
                throw new FileNotFoundException(fileName + " could not be found");
            }
            final CSVReader reader = new CSVReader(new FileReader(file));
            return getPreviewFromCSV(reader, lines);
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
