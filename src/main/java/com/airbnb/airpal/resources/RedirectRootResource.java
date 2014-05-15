package com.airbnb.airpal.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import java.net.URI;

@Path("/")
public class RedirectRootResource {

    @GET
    public Response redirectToApp()
    {
        return Response.temporaryRedirect(URI.create("/app"))
                       .status(Response.Status.MOVED_PERMANENTLY)
                       .build();
    }
}
