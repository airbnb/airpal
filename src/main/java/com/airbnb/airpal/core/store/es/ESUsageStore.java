package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.core.ManagedNode;
import com.airbnb.airpal.core.store.UsageStore;
import com.airbnb.airpal.presto.Table;
import com.google.common.collect.ImmutableMap;
import io.dropwizard.util.Duration;
import org.elasticsearch.action.count.CountResponse;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.index.query.FilterBuilders;
import org.elasticsearch.index.query.FilteredQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.RangeQueryBuilder;
import org.elasticsearch.search.facet.Facet;
import org.elasticsearch.search.facet.FacetBuilders;
import org.elasticsearch.search.facet.terms.TermsFacet;
import org.joda.time.DateTime;

import java.util.Map;

import static java.lang.String.format;

/**
 * Author: @andykram
 */
public class ESUsageStore extends BaseESStore implements UsageStore
{
    private final Duration duration;

    public ESUsageStore(ManagedNode managedNode,
                        Duration duration)
    {
        super(managedNode);
        this.duration = duration;
    }

    protected RangeQueryBuilder mkRecentUsageQuery()
    {
        DateTime now = new DateTime();
        return QueryBuilders.rangeQuery("queryFinished")
                            .from(now.minusSeconds((int) duration.toSeconds())
                                     .toDateTimeISO()
                                     .toString())
                            .to(now.toDateTimeISO().toString());
    }

    @Override
    public long getUsages(Table table)
    {
        try {
            FilteredQueryBuilder filteredQueryBuilder = QueryBuilders.filteredQuery(
                    mkRecentUsageQuery(),
                    FilterBuilders.andFilter(
                            FilterBuilders.termFilter("tablesUsed.connectorId", table.getConnectorId()),
                            FilterBuilders.termFilter("tablesUsed.schema", table.getSchema()),
                            FilterBuilders.termFilter("tablesUsed.table", table.getTable())));

            CountResponse response = client()
                    .prepareCount("jobs")
                    .setQuery(filteredQueryBuilder)
                    .execute()
                    .actionGet();

            return response.getCount();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private static String tableToFacet(Table table)
    {
        return format("used_%s", table.getFqn());
    }

    @Override
    public Map<Table, Long> getUsages(Iterable<Table> tables)
    {
        SearchRequestBuilder search = client().prepareSearch("jobs")
                .setQuery(mkRecentUsageQuery());

        for (Table table : tables) {
            search.addFacet(
                    FacetBuilders.termsFacet(tableToFacet(table))
                                 .field("tablesUsed.fqn")
                                 .facetFilter(FilterBuilders.termFilter("tablesUsed.fqn", table.getFqn())));
        }

        final SearchResponse response = search.execute().actionGet();
        ImmutableMap.Builder<Table, Long> builder = ImmutableMap.builder();

        if (response.getFacets() != null) {
            Map<String, Facet> facetsMap = response.getFacets().facetsAsMap();

            for (Table table : tables) {
                TermsFacet facet = (TermsFacet) facetsMap.get(tableToFacet(table));

                if (facet != null) {
                    builder.put(table, facet.getTotalCount());
                }
            }
        }

        return builder.build();
    }

    @Override
    public void markUsage(Table table) {
        // NO-OP, should be provided by writes in ESJobHistoryStore
    }

    @Override
    public Duration window()
    {
        return duration;
    }
}
