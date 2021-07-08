package com.airbnb.airpal.core.store.history;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;

import java.util.List;

public interface JobHistoryStore
{
    List<Job> getRecentlyRun(long maxResults);

    List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);

    List<Job> getRecentlyRun(long maxResults, Iterable<Table> tables);

    List<Job> getRecentlyRunForUser(String user, long maxResults);

    List<Job> getRecentlyRunForUser(String user, long maxResults, Iterable<Table> tables);

    void addRun(Job job);
}
