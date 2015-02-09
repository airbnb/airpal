package com.airbnb.airpal.sql.beans;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.api.output.PersistentJobOutputFactory;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.facebook.presto.client.QueryError;
import com.facebook.presto.execution.QueryStats;
import com.hubspot.rosetta.StoredAsJson;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;
import org.skife.jdbi.v2.FoldController;
import org.skife.jdbi.v2.Folder3;
import org.skife.jdbi.v2.StatementContext;

import java.net.URI;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Data
public class JobTableOutputJoinRow
{
    private long id;
    private String query;
    private String user;
    private UUID uuid;
    @StoredAsJson
    private QueryStats queryStats;
    private JobState state;
    @StoredAsJson
    private List<Column> columns;
    private DateTime queryFinished;
    private DateTime queryStarted;
    @StoredAsJson
    private QueryError error;
    private String connectorId;
    private String schema;
    private String table;
    private String type;
    private String description;
    private URI location;

    public PersistentJobOutput getJobOutput()
    {
        return PersistentJobOutputFactory.create(getType(), getDescription(), getLocation());
    }

    public static class JobFolder implements Folder3<Map<Long, Job>, JobTableOutputJoinRow>
    {
        @Override
        public Map<Long, Job> fold(
                Map<Long, Job> accumulator,
                JobTableOutputJoinRow rs,
                FoldController control,
                StatementContext ctx)
                throws SQLException
        {
            if (!accumulator.containsKey(rs.getId())) {
                accumulator.put(
                        rs.getId(),
                        new Job(
                                rs.getUser(),
                                rs.getQuery(),
                                rs.getUuid(),
                                rs.getJobOutput(),
                                rs.getQueryStats(),
                                rs.getState(),
                                rs.getColumns(),
                                new HashSet<Table>(),
                                rs.getQueryStarted(),
                                rs.getError(),
                                rs.getQueryFinished()));
            }

            Job job = accumulator.get(rs.getId());
            if (rs.getConnectorId() != null && rs.getSchema() != null && rs.getTable() != null) {
                job.getTablesUsed().add(new Table(rs.getConnectorId(), rs.getSchema(), rs.getTable()));
            }

            return accumulator;
        }
    }
}
