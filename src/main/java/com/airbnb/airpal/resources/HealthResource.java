package com.airbnb.airpal.resources;

import com.codahale.metrics.health.HealthCheck;
import com.codahale.metrics.health.HealthCheckRegistry;
import io.dropwizard.jersey.caching.CacheControl;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.Map;
import java.util.SortedMap;

@Path("/health")
@Produces(MediaType.APPLICATION_JSON)
public class HealthResource {
    private final HealthCheckRegistry registry;

    @Inject
    public HealthResource(HealthCheckRegistry registry) {
        this.registry = registry;
    }

    @GET
    @CacheControl(mustRevalidate = true, noCache = true, noStore = true)
    public Response health() {
        final SortedMap<String, HealthCheck.Result> results = registry.runHealthChecks();
        if (results.isEmpty()) {
            return Response.status(new NotImplementedStatus()).entity(results).build();
        } else {
            if (isAllHealthy(results)) {
                return Response.status(Response.Status.OK).entity(results).build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(results).build();
            }
        }
    }

    private static boolean isAllHealthy(Map<String, HealthCheck.Result> results) {
        for (HealthCheck.Result result : results.values()) {
            if (!result.isHealthy()) {
                return false;
            }
        }
        return true;
    }

    private static final class NotImplementedStatus implements Response.StatusType
    {
        @Override
        public int getStatusCode() {
            return 501;
        }

        @Override
        public String getReasonPhrase() {
            return "Not Implemented";
        }

        @Override
        public Response.Status.Family getFamily() {
            return Response.Status.Family.SERVER_ERROR;
        }
    }
}