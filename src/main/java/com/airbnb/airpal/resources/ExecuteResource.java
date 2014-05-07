package com.airbnb.airpal.resources;

import com.airbnb.airpal.api.ExecutionRequest;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.core.execution.ExecutionClient;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Inject;
import lombok.Data;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.io.IOException;
import java.util.UUID;

/**
 * Author: @andykram
 */
@Path("/api/execute")
public class ExecuteResource {

    private ExecutionClient executionClient;

    @Inject
    public ExecuteResource(ExecutionClient executionClient)
    {
        this.executionClient = executionClient;
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response executeQuery(ExecutionRequest request) throws IOException
    {
        Subject subject = SecurityUtils.getSubject();
        if (subject.getPrincipal() instanceof AirpalUser) {
            AirpalUser user = (AirpalUser) subject.getPrincipal();
            final UUID queryUuid = executionClient.runQuery(request,
                    user.getUserName(),
                    subject,
                    user.getDefaultSchema(),
                    user.getQueryTimeout());

            return Response.ok(new ExecutionSuccess(queryUuid)).build();
        }

        return Response.status(Response.Status.NOT_FOUND)
                       .entity(new ExecutionError("No Airpal user found"))
                       .build();
    }

    @GET
    @Path("permissions")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPermissions()
    {
        Subject subject = SecurityUtils.getSubject();
        AirpalUser user = subject.getPrincipals().oneByType(AirpalUser.class);

        if (user == null) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } else {
            return Response.ok(new ExecutionPermissions(
                    AuthorizationUtil.isAuthorizedWrite(subject, "hive", "airpal", "any"),
                    true,
                    user.getUserName(),
                    user.getAccessLevel()
            )).build();
        }
    }

    @Data
    public static class ExecutionSuccess
    {
        @JsonProperty
        public final UUID uuid;
    }

    @Data
    public static class ExecutionError
    {
        @JsonProperty
        public final String message;
    }

    @Data
    public static class ExecutionPermissions
    {
        private final boolean canCreateTable;
        private final boolean canCreateCsv;
        private final String userName;
        private final String accessLevel;
    }
}
