package com.airbnb.airpal.resources;

import au.com.bytecode.opencsv.CSVReader;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Inject;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Path("/api/preview")
public class ResultsPreviewResource
{
    private final ExpiringFileStore fileStore;

    @Inject
    public ResultsPreviewResource(ExpiringFileStore fileStore)
    {
        this.fileStore = fileStore;
    }

    @GET
    @Path("/{fileName}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFile(@PathParam("fileName") String fileName,
                            @DefaultValue("100") @QueryParam("lines") int numLines)
    {
        final File file = fileStore.get(fileName);
        final int lines = numLines;
        try {
            if (file == null) {
                throw new FileNotFoundException(fileName + " could not be found");
            }
            final CSVReader reader = new CSVReader(new FileReader(file));

            List<String> columns = Arrays.asList(reader.readNext());
            List<List<String>> rows = new ArrayList<>();
            String[] currentLine = reader.readNext();
            for (int line = 0; line < lines && currentLine != null; line++) {
                rows.add(Arrays.asList(currentLine));
                currentLine = reader.readNext();
            }
            return Response.ok(new PreviewResponse(columns, rows)).build();
        } catch (FileNotFoundException e) {
            log.warn(e.getMessage());
            return Response.status(Response.Status.NOT_FOUND).build();
        } catch (IOException e) {
            log.error(e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Data
    private static class PreviewResponse
    {
        @JsonProperty
        private final List<String> columns;

        @JsonProperty
        private final List<List<String>> data;
    }
}
