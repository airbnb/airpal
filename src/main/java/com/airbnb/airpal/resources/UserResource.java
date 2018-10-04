package com.airbnb.airpal.resources;

import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Value;
import org.secnod.shiro.jaxrs.Auth;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/api/user")
@Produces(MediaType.APPLICATION_JSON)
public class UserResource
{
    @GET
    public Response getUserInfo(@Auth AirpalUser user)
    {
        if (user == null) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } else {
            return Response.ok(
                    new UserInfo(
                            user.getUserName(),
                            new ExecutionPermissions(
                                    AuthorizationUtil.isAuthorizedWrite(user, "hive", "airpal", "any"),
                                    true,
                                    user.getAccessLevel())
            )).build();
        }
    }

    @Value
    private static class UserInfo
    {
        @JsonProperty
        private final String name;
        @JsonProperty
        private final ExecutionPermissions executionPermissions;
    }

    @Value
    public static class ExecutionPermissions
    {
        @JsonProperty
        private final boolean canCreateTable;
        @JsonProperty
        private final boolean canCreateCsv;
        @JsonProperty
        private final String accessLevel;
    }
}
