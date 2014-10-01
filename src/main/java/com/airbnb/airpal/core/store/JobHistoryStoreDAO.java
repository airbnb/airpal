package com.airbnb.airpal.core.store;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;
import org.skife.jdbi.v2.sqlobject.SqlQuery;

import java.util.List;

public interface JobHistoryStoreDAO
        extends JobHistoryStore
{
    @SqlQuery("SELECT ")
    public List<Job> getRecentlyRun();

    public List<Job> getRecentlyRun(long maxResults);

    public List<Job> getRecentlyRun(Table table1, Table... otherTables);

    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);

    public void addRun(Job job);
}
