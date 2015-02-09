package com.airbnb.airpal.resources;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.airbnb.airpal.api.queries.CreateSavedQueryBuilder;
import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.core.store.history.JobHistoryStore;
import com.airbnb.airpal.core.store.queries.QueryStore;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Ordering;
import com.google.inject.Inject;
import org.joda.time.DateTime;
import org.secnod.shiro.jaxrs.Auth;

import javax.annotation.Nullable;
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
    public Response getSaved(
            @Auth AirpalUser user,
            @QueryParam("table") List<PartitionedTable> tables)
    {
        if (user != null) {
            return Response.ok(queryStore.getSavedQueries(user)).build();
        }

        return Response.ok(Collections.<SavedQuery>emptyList()).build();
    }

    @POST
    @Path("saved")
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveQuery(
            @Auth AirpalUser user,
            @FormParam("description") String description,
            @FormParam("name") String name,
            @FormParam("query") String query)
    {
        CreateSavedQueryBuilder createFeaturedQueryRequest = CreateSavedQueryBuilder.featured()
                .description(description)
                .name(name)
                .query(query);
        if (user != null) {
            SavedQuery savedQuery = createFeaturedQueryRequest.user(user.getUserName())
                    .build();

            if (queryStore.saveQuery((UserSavedQuery) savedQuery)) {
                return Response.ok(savedQuery.getUuid()).build();
            }
            else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        }

        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @DELETE
    @Path("saved/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteQuery(
            @Auth AirpalUser user,
            @PathParam("uuid") UUID uuid)
    {
        if (user != null) {
            if (queryStore.deleteSavedQuery(user, uuid)) {
                return Response.status(Response.Status.NO_CONTENT).build();
            }
            else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        }
        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    public static Function<Job, DateTime> JOB_ORDERING = new Function<Job, DateTime>()
    {
        @Nullable
        @Override
        public DateTime apply(@Nullable Job input)
        {
            if (input == null) {
                return null;
            }
            return input.getQueryFinished();
        }
    };

    @GET
    @Path("history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistory(
            @Auth AirpalUser user,
            @QueryParam("table") List<Table> tables)
    {
        Iterable<Job> recentlyRun;

        if (tables.size() < 1) {
            recentlyRun = jobHistoryStore.getRecentlyRun(200);
        }
        else {
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
                if (AuthorizationUtil.isAuthorizedRead(user, table)) {
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

        List<Job> sortedResult = Ordering
                .natural()
                .nullsLast()
                .onResultOf(JOB_ORDERING)
                .reverse()
                .immutableSortedCopy(filtered.build());
        return Response.ok(sortedResult).build();
    }
}
