package com.airbnb.airpal.core.store;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;

import java.util.List;

public interface JobHistoryStore
{
    public List<Job> getRecentlyRun(long maxResults);

    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);

    public List<Job> getRecentlyRun(long maxResults, List<Table> tables);

    public void addRun(Job job);
}
