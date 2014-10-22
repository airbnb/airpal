package com.airbnb.airpal.sql.dao;

import com.airbnb.airpal.api.output.PersistentJobOutput;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;

public interface JobOutputDAO
{
    @SqlUpdate(
            "INSERT INTO job_outputs (type, description, location, job_id) " +
                    "VALUES (:type, :description, :location, :jobId)")
    @GetGeneratedKeys
    long createJobOutput(
            @BindBean PersistentJobOutput output,
            @Bind("jobId") long jobId
    );
}
