package com.airbnb.airpal.core.store;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Joiner;
import lombok.Data;
import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.PreparedBatch;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.String.format;

@Data
public class JobHistoryStoreDAO
        implements JobHistoryStore
{
    private final DBI dbi;
    private final ObjectMapper objectMapper;

    @Override
    public List<Job> getRecentlyRun()
    {
        return getRecentlyRun(100);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults)
    {
        try (Handle handle = dbi.open()) {
            Query<Map<String, Object>> query = handle.createQuery(
                    format("SELECT * FROM jobs j" +
                            "LEFT OUTER JOIN job_tables jt ON j.id = jt.job_id " +
                            "LEFT OUTER JOIN tables t ON jt.table_id = jt.table_id " +
                            "ORDER BY query_finished " +
                            "DESC LIMIT %d", maxResults));
        }

        return Collections.emptyList();
    }

    @Override
    public List<Job> getRecentlyRun(Table table1, Table... otherTables)
    {
        return Collections.emptyList();
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables)
    {
        return Collections.emptyList();
    }

    private static Joiner OR_JOINER = Joiner.on(" OR ").skipNulls();
    private static TableMapper TABLE_MAPPER = new TableMapper();

    @Override
    public void addRun(Job job)
    {
        try (Handle handle = dbi.open()) {
            // Create the Job
            handle.execute(
                    "INSERT INTO jobs (query, user, uuid, queryStats, state, columns, query_finished, query_started, error) " +
                            "VALUES (%, %, %, %, %, %, %, %, %)",
                    job.getQuery(),
                    job.getUser(),
                    job.getUuid().toString(),
                    objectMapper.writeValueAsString(job.getQueryStats()),
                    job.getState().toString(),
                    objectMapper.writeValueAsString(job.getColumns()),
                    job.getQueryFinished(),
                    job.getQueryStarted());

            // Find all tables already represented
            Set<String> tablesUsedQueries = new HashSet<>(job.getTablesUsed().size());
            for (Table table : job.getTablesUsed()) {
                tablesUsedQueries.add(format("(connector_id = %s AND schema_ = %s AND table_ = %s)",
                        table.getConnectorId(),
                        table.getSchema(),
                        table.getTable()));
            }
            List<Table> tablesInDb = handle.createQuery(format("SELECT * FROM tables WHERE %s", OR_JOINER.join(tablesUsedQueries)))
                    .map(TABLE_MAPPER)
                    .list();
            PreparedBatch tableBatch = handle.prepareBatch("INSERT INTO tables (connector_id, schema_, table_, columns) VALUES (%, %, %, %)");
            
        }
        catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public static class TableMapper implements ResultSetMapper<Table>
    {
        @Override
        public Table map(int index, ResultSet r, StatementContext ctx)
                throws SQLException
        {
            return new Table(r.getString("connector_id"), r.getString("schema_"), r.getString("table_"));
        }
    }

    public static class JobMapper implements ResultSetMapper<Job>
    {
        @Override
        public Job map(int index, ResultSet r, StatementContext ctx)
                throws SQLException
        {
//            return new Job(
//                    r.getString("user"),
//                    )
            return null;
        }
    }
//    @SqlQuery("SELECT * FROM jobs ORDER BY query_finished DESC LIMIT 100")
//    public List<Job> getRecentlyRun();
//
//    @SqlQuery("SELECT * FROM jobs ORDER BY query_finished DESC LIMIT :max_results")
//    public List<Job> getRecentlyRun(@Bind("max_results") long maxResults);
//
//    @SqlQuery("SELECT * FROM jobs ORDER BY query_finished DESC LIMIT :max_results")
//    public List<Job> getRecentlyRun(Table table1, Table... otherTables);
//
//    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);
//
//    public void addRun(Job job);
}
