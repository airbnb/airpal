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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

@Path("/api/files")
public class FilesResource
{
    private final ExpiringFileStore fileStore;

    @Inject
    public FilesResource(ExpiringFileStore fileStore)
    {
        this.fileStore = fileStore;
    }

    @GET
    @Path("/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getFile(@PathParam("fileName") String fileName)
    {
        final File file = fileStore.get(fileName);

        if (file == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        } else {
            return Response.ok(new StreamingOutput() {
                @Override
                public void write(OutputStream output)
                        throws IOException, WebApplicationException
                {
                    // TODO: Make this use chunked encoding?
                    try (FileInputStream inputStream = new FileInputStream(file)) {
                        ByteStreams.copy(inputStream, output);
                    } finally {
                        output.close();
                    }
                }
            }).build();
        }
    }
}
