package com.airbnb.airpal.sql.dao;

import com.airbnb.airpal.api.Job;
import com.hubspot.rosetta.jdbi.RosettaBinder;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;

public interface JobDAO
{
    @SqlUpdate(
            "INSERT INTO jobs (query, user, uuid, queryStats, state, columns, query_finished, query_started, error) " +
            "VALUES (" +
                    ":query, " +
                    ":user, " +
                    ":uuid, " +
                    ":queryStats, " +
                    ":state, " +
                    ":columns, " +
                    "FROM_UNIXTIME(ROUND(:queryFinished / 1000)), " +
                    "FROM_UNIXTIME(ROUND(:queryStarted / 1000)), " +
                    ":error)")
    @GetGeneratedKeys
    long createJob(
            @RosettaBinder Job job
    );
}