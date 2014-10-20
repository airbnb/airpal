package com.airbnb.airpal.resources;

import com.airbnb.airpal.service.LoginView;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.util.WebUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import java.io.IOException;
import java.net.URI;

@Path("/")
public class SessionResource
{

    @GET
    public Response redirectToApp()
    {
        return Response.temporaryRedirect(URI.create("/app"))
                .status(Response.Status.MOVED_PERMANENTLY)
                .build();
    }

    @GET
    @Path("/login")
    @Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
    public LoginView getLogin()
    {
        return new LoginView();
    }

    @POST
    @Path("/login")
    public void doLogin(
            @Context HttpServletRequest request,
            @Context HttpServletResponse response,
            @FormParam("username") String username,
            @FormParam("password") String password)
            throws IOException
    {
        Subject currentUser = SecurityUtils.getSubject();
        if (!currentUser.isAuthenticated()) {
            AuthenticationToken token = new UsernamePasswordToken(username, password);
            currentUser.login(token);
        }

        WebUtils.redirectToSavedRequest(request, response, "/app");
    }

    @GET
    @Path("/postlogin")
    @Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
    public Response getLoginNoRemember()
    {
        return Response.temporaryRedirect(URI.create("/app")).cookie(new NewCookie("rememberMe", null)).build();
    }
}
