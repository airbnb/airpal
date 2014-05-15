package com.airbnb.airpal.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import java.net.URI;

@Path("/login")
public class LoginResource
{
    @GET
    @Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
    public Response getLogin()
    {
        return Response.temporaryRedirect(URI.create("/app")).cookie(new NewCookie("rememberMe", null)).build();
    }
}
