package com.airbnb.airpal.resources;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.airbnb.airpal.api.queries.CreateSavedQueryBuilder;
import com.airbnb.airpal.api.queries.FeaturedQuery;
import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.core.store.JobHistoryStore;
import com.airbnb.airpal.core.store.QueryStore;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Path("/api/query")
public class QueryResource
{
    private final JobHistoryStore jobHistoryStore;
    private final QueryStore queryStore;

    @Inject
    public QueryResource(JobHistoryStore jobHistoryStore,
                         QueryStore queryStore)
    {
        this.jobHistoryStore = jobHistoryStore;
        this.queryStore = queryStore;
    }

    @GET
    @Path("saved")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSaved(@QueryParam("table") List<PartitionedTable> tables)
    {
        Subject subject = SecurityUtils.getSubject();

        if (subject.getPrincipal() instanceof AirpalUser) {
            AirpalUser user = (AirpalUser) subject.getPrincipal();
            return Response.ok(queryStore.getSavedQueries(user)).build();
        }

        return Response.ok(Collections.<SavedQuery>emptyList()).build();
    }

    @POST
    @Path("saved")
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveQuery(@FormParam("description") String description,
                              @FormParam("name") String name,
                              @FormParam("query") String query)
    {
        CreateSavedQueryBuilder createFeaturedQueryRequest = CreateSavedQueryBuilder.featured()
                                                                                    .description(description)
                                                                                    .name(name)
                                                                                    .query(query);
        Subject subject = SecurityUtils.getSubject();

        if (subject.getPrincipal() instanceof AirpalUser) {
            AirpalUser user = (AirpalUser) subject.getPrincipal();
            SavedQuery savedQuery = createFeaturedQueryRequest.user(user.getUserName())
                                                              .build();

            if (queryStore.saveQuery((UserSavedQuery) savedQuery)) {
                return Response.ok(savedQuery.getUuid()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        }

        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @DELETE
    @Path("saved/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteQuery(@PathParam("uuid") UUID uuid)
    {
        Subject subject = SecurityUtils.getSubject();
        if (subject.getPrincipal() instanceof AirpalUser) {
            AirpalUser user = (AirpalUser) subject.getPrincipal();
            if (queryStore.deleteSavedQuery(user, uuid)) {
                return Response.status(Response.Status.NO_CONTENT).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        }
        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("featured")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFeatured(@QueryParam("table") List<PartitionedTable> tables)
    {
        if (tables == null || tables.size() < 1) {
            return Response.ok(queryStore.getFeaturedQueries()).build();
        }

        return Response.ok(queryStore.getFeaturedQueries(tables)).build();
    }

    @POST
    @Path("featured")
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveFeatured(@FormParam("description") String description,
                                 @FormParam("query") String query)
    {
        CreateSavedQueryBuilder createFeaturedQueryRequest = CreateSavedQueryBuilder.featured()
                                                                                    .description(description)
                                                                                    .query(query);

        Subject subject = SecurityUtils.getSubject();

        if (subject.getPrincipal() instanceof AirpalUser && false) {
            AirpalUser user = (AirpalUser) subject.getPrincipal();
            FeaturedQuery featuredQuery = (FeaturedQuery) createFeaturedQueryRequest.build();

            if (queryStore.saveFeaturedQuery(featuredQuery)) {
                return Response.ok().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        }

        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistory(@QueryParam("table") List<Table> tables)
    {
        Subject subject = SecurityUtils.getSubject();
        Iterable<Job> recentlyRun;

        if (tables.size() < 1) {
            recentlyRun = jobHistoryStore.getRecentlyRun(200);
        } else {
            Table[] tablesArray = tables.toArray(new Table[tables.size()]);
            Table[] restTables = Arrays.copyOfRange(tablesArray, 1, tablesArray.length);

            recentlyRun = jobHistoryStore.getRecentlyRun(200, tablesArray[0], restTables);
        }

        ImmutableList.Builder<Job> filtered = ImmutableList.builder();
        for (Job job : recentlyRun) {
            if (job.getTablesUsed().isEmpty() && (job.getState() == JobState.FAILED)) {
                filtered.add(job);
                continue;
            }
            for (Table table : job.getTablesUsed()) {
                if (AuthorizationUtil.isAuthorizedRead(subject, table)) {
                    filtered.add(new Job(
                            job.getUser(),
                            job.getQuery(),
                            job.getUuid(),
                            job.getOutput(),
                            job.getQueryStats(),
                            job.getState(),
                            Collections.<Column>emptyList(),
                            Collections.<Table>emptySet(),
                            job.getQueryStartedDateTime(),
                            job.getError(),
                            job.getQueryFinishedDateTime()));
                }
            }
        }

        return Response.ok(filtered.build()).build();
    }
}
