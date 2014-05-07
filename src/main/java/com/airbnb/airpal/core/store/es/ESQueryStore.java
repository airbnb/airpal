package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.api.queries.FeaturedQuery;
import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.ManagedNode;
import com.airbnb.airpal.core.store.QueryStore;
import com.airbnb.airpal.presto.PartitionedTable;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Author: @andykram
 */
public class ESQueryStore extends BaseESStore implements QueryStore
{
    public static final String FEATURED = "featured";
    public static final String USER_SAVED = "userSaved";
    private final ObjectMapper objectMapper;

    @Inject
    public ESQueryStore(ManagedNode managedNode,
                        ObjectMapper objectMapper)
    {
        super(managedNode);
        this.objectMapper = objectMapper;
    }


    @Override
    public List<FeaturedQuery> getFeaturedQueries()
    {
        SearchResponse response = client()
                .prepareSearch("queries")
                .setTypes(FEATURED)
                .addSort(SortBuilders.fieldSort("createdAt").order(SortOrder.DESC))
                .execute()
                .actionGet();

        final ImmutableList.Builder<FeaturedQuery> queryBuilder = ImmutableList.builder();

        for (SearchHit hit : response.getHits()) {
            try {
//                System.out.println("hit.source() " + new String(hit.source()));
                FeaturedQuery query = objectMapper.readValue(hit.source(), FeaturedQuery.class);
                queryBuilder.add(query);
            } catch (IOException e) {
                e.printStackTrace();
//                System.out.println("From src:\n" + new String(hit.source()));
            }
        }

        return queryBuilder.build();
    }

    @Override
    public List<FeaturedQuery> getFeaturedQueries(List<PartitionedTable> tables)
    {
        return Collections.emptyList();
    }

    @Override
    public boolean saveFeaturedQuery(FeaturedQuery query)
    {
        try {
            String jsonRepresentation = objectMapper.writeValueAsString(query);
            IndexResponse response = client()
                    .prepareIndex("queries", FEATURED)
                    .setSource(jsonRepresentation)
                    .setPercolate("*")
                    .execute()
                    .actionGet();

            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<SavedQuery> getSavedQueries(AirpalUser airpalUser)
    {
        SearchResponse response = client()
                .prepareSearch("queries")
                .setQuery(QueryBuilders.termQuery("user", airpalUser.getUserName()))
                .setTypes(USER_SAVED)
                .addSort(SortBuilders.fieldSort("createdAt").order(SortOrder.DESC))
                .setSize(200)
                .execute()
                .actionGet();

        final ImmutableList.Builder<SavedQuery> queryBuilder = ImmutableList.builder();

        for (SearchHit hit : response.getHits()) {
            try {
                UserSavedQuery query = objectMapper.readValue(hit.source(), UserSavedQuery.class);
                queryBuilder.add(query);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return queryBuilder.build();
    }

    @Override
    public List<SavedQuery> getSavedQueries(AirpalUser airpalUser, List<PartitionedTable> tables)
    {
        return Collections.emptyList();
    }

    @Override
    public boolean saveQuery(UserSavedQuery query)
    {
        try {
            String jsonRepresentation = objectMapper.writeValueAsString(query);
            IndexResponse response = client()
                    .prepareIndex("queries", USER_SAVED)
                    .setSource(jsonRepresentation)
                    .setPercolate("*")
                    .execute()
                    .actionGet();

            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteSavedQuery(AirpalUser airpalUser, UUID queryUUID)
    {
        SavedQuery query = getSavedQuery(queryUUID);
        if (query != null && query.getUser().equals(airpalUser.getUserName())) {
            String queryId = getQueryId(queryUUID);

            DeleteResponse response = client().prepareDelete("queries", USER_SAVED, queryId).execute().actionGet();

            return !response.isNotFound() && response.getId().equals(queryId);
        }

        return false;
    }

    @Override
    public boolean deleteFeaturedQuery(AirpalUser airpalUser, UUID queryUUID)
    {
        return false;
    }

    protected String getQueryId(UUID queryUUID)
    {
        SearchResponse response = client()
                .prepareSearch("queries")
                .setQuery(QueryBuilders.matchQuery("uuid", queryUUID.toString()))
                .addSort(SortBuilders.fieldSort("createdAt").order(SortOrder.DESC))
                .setSize(1)
                .execute()
                .actionGet();

        if (response.getHits().totalHits() >= 1) {
            return response.getHits().getAt(0).getId();
        }

        return null;
    }

    @Override
    public SavedQuery getSavedQuery(UUID queryUUID)
    {
        SearchResponse response = client()
                .prepareSearch("queries")
                .setQuery(QueryBuilders.matchQuery("uuid", queryUUID.toString()))
                .addSort(SortBuilders.fieldSort("createdAt").order(SortOrder.DESC))
                .execute()
                .actionGet();

        for (SearchHit hit : response.getHits()) {
            try {
                return objectMapper.readValue(hit.source(), UserSavedQuery.class);
            } catch (IOException e) {
                e.printStackTrace();
                System.out.println("From src:\n" + new String(hit.source()));
            }
        }

        return null;
    }

    @Override
    public FeaturedQuery getFeaturedQuery(UUID queryUUID)
    {
        return null;
    }
}
