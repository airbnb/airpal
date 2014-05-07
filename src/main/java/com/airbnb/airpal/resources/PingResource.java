package com.airbnb.airpal.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("/ping")
public class PingResource {

    @GET
    public Response ping() {
        return Response.status(Response.Status.OK).entity("PONG").build();
    }
}