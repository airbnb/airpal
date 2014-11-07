package com.airbnb.airpal.sql.dao;

import com.airbnb.airpal.sql.beans.JobTableRow;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.SqlBatch;

public interface JobTableDAO
{
    @SqlBatch(
            "INSERT INTO job_tables (job_id, table_id) " +
                    "VALUES (:jobId, :tableId)")
    public void createJobTables(@BindBean Iterable<JobTableRow> jobTableRows);
}