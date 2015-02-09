package com.airbnb.airpal.core.store.history;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.sql.Util;
import com.airbnb.airpal.sql.beans.JobTableOutputJoinRow;
import com.airbnb.airpal.sql.beans.JobTableRow;
import com.airbnb.airpal.sql.beans.TableRow;
import com.airbnb.airpal.sql.dao.JobDAO;
import com.airbnb.airpal.sql.dao.JobOutputDAO;
import com.airbnb.airpal.sql.dao.JobTableDAO;
import com.airbnb.airpal.sql.dao.TableDAO;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.inject.Inject;
import com.hubspot.rosetta.jdbi.RosettaResultSetMapperFactory;
import lombok.extern.slf4j.Slf4j;
import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.String.format;

@Slf4j
public class JobHistoryStoreDAO
        implements JobHistoryStore
{
    private final DBI dbi;

    @Inject
    public JobHistoryStoreDAO(DBI dbi)
    {
        this.dbi = dbi;
    }

    private List<Job> getJobs(long limit, int dayInterval, String outerWhereClauseArg, String innerWhereClauseArg)
    {
        String outerWhereClause = Strings.isNullOrEmpty(outerWhereClauseArg) ? "true" : outerWhereClauseArg;
        String innerWhereClause = Strings.isNullOrEmpty(innerWhereClauseArg) ? "true" : innerWhereClauseArg;
        try (Handle handle = dbi.open()) {
            Query<Map<String, Object>> query = handle.createQuery(
                    "SELECT " +
                            "j.id AS id, " +
                            "j.query AS query, " +
                            "j.user AS user, " +
                            "j.uuid AS uuid, " +
                            "j.queryStats as queryStats, " +
                            "j.state AS state, " +
                            "j.columns AS columns, " +
                            "j.query_finished AS queryFinished, " +
                            "j.query_started AS queryStarted, " +
                            "j.error AS error, " +
                            "t.connector_id AS connectorId, " +
                            "t.schema_ AS \"schema\", " +
                            "t.table_ AS \"table\", " +
                            "t.columns, " +
                            "jo.type, " +
                            "jo.description, " +
                            "jo.location " +
                            "FROM (SELECT * FROM jobs " +
                                "WHERE query_finished > DATE_SUB(UTC_TIMESTAMP(), INTERVAL :day_interval day) " +
                                "AND " + innerWhereClause + " " +
                                "ORDER BY query_finished DESC LIMIT :limit) j " +
                            "LEFT OUTER JOIN job_tables jt ON j.id = jt.job_id " +
                            "LEFT OUTER JOIN tables t ON jt.table_id = t.id " +
                            "LEFT OUTER JOIN job_outputs jo ON j.id = jo.job_id " +
                            "WHERE " + outerWhereClause + " " +
                            "ORDER BY query_finished DESC")
                    .bind("limit", limit)
                    .bind("day_interval", dayInterval);

            Map<Long, Job> idToJobMap = query.
                    map(RosettaResultSetMapperFactory.mapperFor(JobTableOutputJoinRow.class)).
                    fold(new HashMap<Long, Job>(), new JobTableOutputJoinRow.JobFolder());
            return new ArrayList<>(idToJobMap.values());
        }
    }

    private List<Job> getJobs(long limit, int dayInterval)
    {
        return getJobs(limit, dayInterval, null, null);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults)
    {
        try {
            return getJobs(maxResults, 1);
        } catch (Exception e) {
            log.error("Caught exception during getRecentlyRun", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables)
    {
        return getRecentlyRun(maxResults, Lists.asList(table1, otherTables));
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Iterable<Table> tables)
    {
        try {
            String tablesClause = Util.getTableCondition(tables);
            return getJobs(maxResults, 1, tablesClause, null);
        } catch (Exception e) {
            log.error("Caught exception during getRecentlyRun", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Job> getRecentlyRunForUser(String user, long maxResults)
    {
        try {
            String usersClause = format("user = '%s'", user);
            return getJobs(maxResults, 1, null, usersClause);
        } catch (Exception e) {
            log.error("Caught exception during getRecentlyRun", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Job> getRecentlyRunForUser(String user, long maxResults, Iterable<Table> tables)
    {
        try {
            String usersClause = format("user = '%s'", user);
            String tablesClause = Util.getTableCondition(tables);
            return getJobs(maxResults, 1, tablesClause, usersClause);
        } catch (Exception e) {
            log.error("Caught exception during getRecentlyRun", e);
            return Collections.emptyList();
        }
    }

    @Override
    public void addRun(Job job)
    {
        JobDAO jobDAO = dbi.onDemand(JobDAO.class);
        TableDAO tableDAO = dbi.onDemand(TableDAO.class);
        JobTableDAO jobTableDAO = dbi.onDemand(JobTableDAO.class);
        JobOutputDAO jobOutputDAO = dbi.onDemand(JobOutputDAO.class);

        // Create the job
        long jobId = jobDAO.createJob(job);
        // Find all presto tables already represented
        Set<TableRow> tablesInDb = Collections.emptySet();
        if (job.getTablesUsed().size() > 0) {
            tablesInDb = new HashSet<>(tableDAO.getTables(new ArrayList<>(job.getTablesUsed())));
        }
        // Figure out which tables are not represented
        Sets.SetView<Table> tablesToAdd = Sets.difference(
                job.getTablesUsed(),
                Sets.newHashSet(Iterables.transform(tablesInDb, TableRow.MAP_TO_TABLE)));
        // Add tables not already represented
        tableDAO.createTables(tablesToAdd);

        Set<TableRow> tablesWithIds = Collections.emptySet();
        if (job.getTablesUsed().size() > 0) {
            tablesWithIds = new HashSet<>(tableDAO.getTables(new ArrayList<>(job.getTablesUsed())));
        }

        List<JobTableRow> jobTableRows = new ArrayList<>(job.getTablesUsed().size());
        for (TableRow tableRow : tablesWithIds) {
            jobTableRows.add(new JobTableRow(-1, jobId, tableRow.getId()));
        }
        // Add associations between Job and Table
        jobTableDAO.createJobTables(jobTableRows);
        if (job.getOutput().getLocation() != null) {
            jobOutputDAO.createJobOutput(job.getOutput(), jobId);
        }
    }
}
