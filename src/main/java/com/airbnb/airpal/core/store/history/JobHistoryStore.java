package com.airbnb.airpal.core.store.history;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;

import java.util.List;

public interface JobHistoryStore
{
    public List<Job> getRecentlyRun(long maxResults);

    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);

    public List<Job> getRecentlyRun(long maxResults, Iterable<Table> tables);

    public List<Job> getRecentlyRunForUser(String user, long maxResults);

    public List<Job> getRecentlyRunForUser(String user, long maxResults, Iterable<Table> tables);

    public void addRun(Job job);
}
