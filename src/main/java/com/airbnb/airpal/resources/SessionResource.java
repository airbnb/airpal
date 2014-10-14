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

import java.io.IOException;

@Path("/login")
public class SessionResource
{
    @GET
    @Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
    public LoginView getLogin()
    {
        return new LoginView();
    }

    @POST
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
}
