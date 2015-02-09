package com.airbnb.airpal.resources;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.core.store.jobs.ActiveJobsStore;
import com.airbnb.airpal.core.store.history.JobHistoryStore;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.PartitionedTable.PartitionedTableToTable;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.resources.UserResource.ExecutionPermissions;
import com.facebook.presto.client.Column;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Ordering;
import com.google.inject.Inject;
import org.secnod.shiro.jaxrs.Auth;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.Collections;
import java.util.List;

import static com.airbnb.airpal.resources.QueryResource.JOB_ORDERING;

@Path("/api/users/{id}")
@Produces(MediaType.APPLICATION_JSON)
public class UsersResource
{
    private final JobHistoryStore jobHistoryStore;
    private final ActiveJobsStore activeJobsStore;

    @Inject
    public UsersResource(JobHistoryStore jobHistoryStore, ActiveJobsStore activeJobsStore)
    {
        this.jobHistoryStore = jobHistoryStore;
        this.activeJobsStore = activeJobsStore;
    }

    @GET
    @Path("permissions")
    public Response getUserPermissions(
            @Auth AirpalUser user,
            @PathParam("id") String userId)
    {
        if (user == null) {
            return Response.status(Response.Status.FORBIDDEN).build();
        } else {
            return Response.ok(
                    new ExecutionPermissions(
                            AuthorizationUtil.isAuthorizedWrite(user, "hive", "airpal", "any"),
                            true,
                            user.getAccessLevel())
            ).build();
        }
    }

    @GET
    @Path("queries")
    public Response getUserQueries(
            @Auth AirpalUser user,
            @PathParam("id") String userId,
            @QueryParam("results") int numResults,
            @QueryParam("table") List<PartitionedTable> tables)
    {
        Iterable<Job> recentlyRun;
        int results = Optional.of(numResults).or(0);
        if (results <= 0) {
            results = 100;
        }

        if (tables.size() < 1) {
            recentlyRun = jobHistoryStore.getRecentlyRunForUser(userId, results);
        } else {
            recentlyRun = jobHistoryStore.getRecentlyRunForUser(
                    userId,
                    results,
                    Iterables.transform(tables, new PartitionedTableToTable()));
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

    @GET
    @Path("active-queries")
    public Response getUserActiveQueries(@Auth AirpalUser user)
    {
        List<Job> sortedResult = Ordering
                .natural()
                .nullsLast()
                .onResultOf(JOB_ORDERING)
                .reverse()
                .immutableSortedCopy(activeJobsStore.getJobsForUser(user));

        return Response.ok(sortedResult).build();
    }
}
