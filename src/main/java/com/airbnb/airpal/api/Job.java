package com.airbnb.airpal.api;

import com.airbnb.airpal.api.output.PersistentJobOutput;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.facebook.presto.client.QueryError;
import com.facebook.presto.execution.QueryStats;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.Sets;
import lombok.Data;
import lombok.experimental.Wither;
import org.joda.time.DateTime;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class Job {

    @JsonProperty
    private final String user;

    @JsonProperty
    private final String query;

    @JsonProperty
    private final UUID uuid;

    @JsonProperty
    @Wither
    private final PersistentJobOutput output;

    @JsonProperty
    @Wither
    private QueryStats queryStats;

    @JsonProperty
    @Wither
    private JobState state;

    @JsonProperty
    private List<Column> columns;

    @JsonProperty
    @Wither
    private Set<Table> tablesUsed;

    @JsonProperty
    @Wither
    private DateTime queryStarted = new DateTime();

    @JsonProperty
    private QueryError error;

    private DateTime queryFinished;

    @JsonCreator
    public Job(@JsonProperty("user") final String user,
            @JsonProperty("query") final String query,
            @JsonProperty("uuid") final UUID uuid,
            @JsonProperty("output") final PersistentJobOutput output,
            @JsonProperty("queryStats") final QueryStats queryStats,
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
             state,
             columns,
             Sets.<Table>newConcurrentHashSet(),
             new DateTime(),
             error,
             queryFinished
        );
    }

    @JsonProperty
    public String getQueryFinished() {
        if (queryFinished != null) {
            return queryFinished.toDateTimeISO().toString();
        } else {
            return null;
        }
    }

    @JsonIgnore
    public Timestamp getQueryFinishedTimeStamp() {
        if (queryFinished != null)
            return new Timestamp(queryFinished.getMillis());

        return null;
    }

    @JsonIgnore
    public DateTime getQueryFinishedDateTime()
    {
        return queryFinished;
    }

    /*
    @JsonProperty
    public DateTime getQueryStarted() {
        return queryStarted.toDateTimeISO();
    }
    */
    @JsonProperty
    public String getQueryStarted() {
        return queryStarted.toDateTimeISO().toString();
    }

    @JsonIgnore
    public Timestamp getQueryStartedTimeStamp() {
        return new Timestamp(queryStarted.getMillis());
    }

    @JsonIgnore
    public DateTime getQueryStartedDateTime()
    {
        return queryStarted;
    }

    public void addTableUsage(final Table table) {
        tablesUsed.add(table);
    }

}
