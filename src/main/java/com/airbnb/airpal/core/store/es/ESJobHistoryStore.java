package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.core.ManagedESClient;
import com.airbnb.airpal.core.store.JobHistoryStore;
import com.airbnb.airpal.presto.Table;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.indices.IndexMissingException;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class ESJobHistoryStore extends BaseESStore implements JobHistoryStore
{
    private final ObjectMapper objectMapper;

    @Inject
    public ESJobHistoryStore(ManagedESClient managedNode,
                             ObjectMapper objectMapper)
    {
        super(managedNode);
        this.objectMapper = objectMapper;
    }

    @Override
    public List<Job> getRecentlyRun()
    {
        return getRecentlyRun(300);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults)
    {
        try {
            SearchResponse response = client()
                    .prepareSearch("jobs")
                    .setTypes("job")
                    .setQuery(QueryBuilders.matchAllQuery())
                    .addSort(SortBuilders.fieldSort("queryFinished").order(SortOrder.DESC))
                    .setSize((int) maxResults)
                    .execute()
                    .actionGet();
            final ImmutableList.Builder<Job> jobs = ImmutableList.builder();

            for (SearchHit hit : response.getHits()) {
                try {
                    Job job = objectMapper.readValue(hit.sourceAsString(), Job.class);
                    jobs.add(job);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return jobs.build();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @Override
    public List<Job> getRecentlyRun(Table table1, Table... otherTables) {
        return getRecentlyRun(300, table1, otherTables);
    }

    @Override
    public List<Job> getRecentlyRun(long maxResults, Table table1, Table... otherTables)
    {
        try {
            final ImmutableSet.Builder<String> tablesFqns = ImmutableSet.builder();
            for (Table table : Lists.asList(table1, otherTables)) {
                tablesFqns.add(table.getFqn());
            }

            SearchResponse response = client()
                    .prepareSearch("jobs")
                    .setQuery(QueryBuilders.inQuery("tablesUsed.fqn", tablesFqns.build()))
                    .addSort(SortBuilders.fieldSort("queryFinished").order(SortOrder.DESC))
                    .setSize((int) maxResults)
                    .execute()
                    .actionGet();

            final ImmutableList.Builder<Job> jobs = ImmutableList.builder();

            for (SearchHit hit : response.getHits()) {
                try {
                    jobs.add(objectMapper.readValue(hit.source(), Job.class));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            return jobs.build();
        } catch (IndexMissingException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @Override
    public void addRun(Job job) {
        try {
            String jsonRepresentation = objectMapper.writeValueAsString(job);
            IndexResponse response = client()
                    .prepareIndex("jobs", "job", job.getUuid().toString())
                    .setSource(jsonRepresentation)
                    .setPercolate("*")
                    .execute()
                    .actionGet();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
