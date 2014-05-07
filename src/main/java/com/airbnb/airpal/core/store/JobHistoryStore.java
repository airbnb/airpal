package com.airbnb.airpal.core.store;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.presto.Table;

import java.util.List;

/**
 * Author: @andykram
 */
public interface JobHistoryStore {

    public List<Job> getRecentlyRun();

    public List<Job> getRecentlyRun(long maxResults);

    public List<Job> getRecentlyRun(Table table1, Table... otherTables);

    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables);

    public void addRun(Job job);

}
