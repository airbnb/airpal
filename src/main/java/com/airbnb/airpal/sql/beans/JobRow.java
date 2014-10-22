package com.airbnb.airpal.sql.beans;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.JobState;
import com.facebook.presto.client.QueryError;
import com.facebook.presto.execution.QueryStats;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.joda.time.DateTime;

import java.util.UUID;

@Data
@AllArgsConstructor
public class JobRow
{
    private long id;
    private String user;
    private String query;
    private UUID uuid;
    private QueryStats queryStats;
    private JobState state;
    private DateTime queryStarted;
    private DateTime queryFinished;
    private QueryError error;

    public Job toJob()
    {
        return new Job(
                getUser(),
                getQuery(),
                getUuid(),
                null,
                getQueryStats(),
                getState(),
                null,
                null,
                getQueryStarted(),
                getError(),
                getQueryFinished());
    }
}
