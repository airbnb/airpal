package com.airbnb.airpal.api;

import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.facebook.presto.client.QueryError;
import com.facebook.presto.client.StageStats;
import com.facebook.presto.execution.QueryStats;
import com.fasterxml.jackson.annotation.*;
import com.google.common.collect.Sets;
import com.hubspot.rosetta.StoredAsJson;
import lombok.Data;
import lombok.experimental.Wither;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class Job
{
    @JsonProperty
    @Wither
    private final String user;

    @JsonProperty
    @Wither
    private final String query;

    @JsonProperty
    @Wither
    private final UUID uuid;

    @JsonProperty
    @Wither
    private final PersistentJobOutput output;

    @JsonProperty
    @Wither
    @StoredAsJson
    private QueryStats queryStats;

    @JsonProperty
    @Wither
    @StoredAsJson
    private List<StageStats> stageStats;

    @JsonProperty
    @Wither
    private JobState state;

    @JsonProperty
    @StoredAsJson
    private List<Column> columns;

    @JsonProperty
    @Wither
    private Set<Table> tablesUsed;

    @JsonProperty
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Wither
    private DateTime queryStarted = new DateTime();

    @JsonProperty
    @StoredAsJson
    private QueryError error;

    @JsonProperty
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Wither
    private DateTime queryFinished;

    @JsonCreator
    public Job(@JsonProperty("user") final String user,
            @JsonProperty("query") final String query,
            @JsonProperty("uuid") final UUID uuid,
            @JsonProperty("output") final PersistentJobOutput output,
            @JsonProperty("queryStats") final QueryStats queryStats,
            @JsonProperty("stageStats") final List<StageStats> stageStats,
            @JsonProperty("state") final JobState state,
            @JsonProperty("columns") final List<Column> columns,
            @JsonProperty("tablesUsed") final Set<Table> tablesUsed,
            @JsonProperty("queryStarted") final DateTime queryStarted,
            @JsonProperty("error") final QueryError error,
            @JsonProperty("queryFinished") final DateTime queryFinished)
    {
        this.user = user;
        this.query = query;
        this.uuid = uuid;
        this.output = output;
        this.queryStats = queryStats;
        this.stageStats = stageStats;
        this.state = state;
        this.columns = columns;
        this.tablesUsed = tablesUsed;
        this.queryStarted = queryStarted;
        this.error = error;
        this.queryFinished = queryFinished;
    }

    public Job(final String user,
            final String query,
            final UUID uuid,
            final PersistentJobOutput output,
            final QueryStats stats,
            final List<StageStats> stageStats,
            final JobState state,
            final List<Column> columns,
            final QueryError error,
            final DateTime queryFinished)
    {
        this(user,
             query,
             uuid,
             output,
             stats,
             stageStats,
             state,
             columns,
             Sets.<Table>newConcurrentHashSet(),
             new DateTime(),
             error,
             queryFinished
        );
    }

    @JsonIgnore
    public DateTime getQueryFinishedDateTime()
    {
        return queryFinished;
    }

    @JsonIgnore
    public DateTime getQueryStartedDateTime()
    {
        return queryStarted;
    }
}
