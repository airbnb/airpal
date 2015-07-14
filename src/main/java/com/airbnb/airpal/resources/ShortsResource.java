package com.airbnb.airpal.resources;

import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.google.common.io.ByteStreams;
import com.google.inject.Inject;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

import java.io.*;

import java.nio.charset.Charset;

@Path("/api/shorts")
public class ShortsResource 
{
    private final ExpiringFileStore fileStore;

    @Inject
    public ShortsResource(ExpiringFileStore fileStore)
    {
        this.fileStore = fileStore;
    }

    @GET
    @Path("/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getFile(@PathParam("fileName") String fileName)
    {
        final File file = fileStore.get(fileName);
        FileReader fileReader;
        try {
            fileReader = new FileReader(file);
            final BufferedReader inputBufferedReader = new BufferedReader(fileReader);
            if (file == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            } else {
                return Response.ok(new StreamingOutput() {
                    @Override
                    public void write(OutputStream output)
                            throws IOException, WebApplicationException
                    {
                        // TODO: Make this use chunked encoding?
                        try {
                            String topNRows = "";
                            for (int i = 0; i < 100; i++) {
                                String currentLine = inputBufferedReader.readLine();

                                if (currentLine == null) {
                                    // we have reached the end of our BufferedReader
                                    break;
                                }
                                if (i != 0) {
                                    topNRows = topNRows.concat(",");
                                }
                                topNRows = topNRows.concat("[" + currentLine + "]");
                            }
                            String header = "[";
                            String footer = "]";
                            output.write((header + topNRows + footer).getBytes(Charset.forName("UTF-8")));
                        } finally {
                            output.close();
                        }
                    }
                }).build();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }
}
