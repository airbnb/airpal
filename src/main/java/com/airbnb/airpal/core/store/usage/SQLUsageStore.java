package com.airbnb.airpal.core.store.usage;

import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.sql.Util;
import com.airbnb.airpal.sql.beans.JobUsageCountRow;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.hubspot.rosetta.jdbi.RosettaResultSetMapperFactory;
import io.dropwizard.util.Duration;
import lombok.extern.slf4j.Slf4j;
import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class SQLUsageStore implements UsageStore
{
    private final Duration duration;
    private final DBI dbi;

    public SQLUsageStore(Duration duration, DBI dbi)
    {
        this.duration = duration;
        this.dbi = dbi;
    }

    @Override
    public long getUsages(Table table)
    {
        Map<Table, Long> usages = getUsages(ImmutableList.of(table));
        if (usages.containsKey(table)) {
            return usages.get(table);
        } else {
            return 0;
        }
    }

    @Override
    public Map<Table, Long> getUsages(Iterable<Table> tables)
    {
        try (Handle handle = dbi.open()) {
            Query<Map<String, Object>> query = handle.createQuery(
                    "SELECT COUNT(*) AS count, connector_id AS connectorId, schema_ AS \"schema\", table_ AS \"table\" " +
                            "FROM jobs j " +
                            "LEFT OUTER JOIN job_tables jt ON j.id = jt.job_id " +
                            "LEFT OUTER JOIN tables t ON jt.table_id = t.id " +
                            "WHERE query_finished > DATE_SUB(UTC_TIMESTAMP(), INTERVAL :day_interval day) " +
                            "AND (" + Util.getTableCondition(Lists.newArrayList(tables)) + ") " +
                            "GROUP BY connector_id, schema_, table_ " +
                            "ORDER BY query_finished DESC")
                    .bind("day_interval", 1);

            return query.
                    map(RosettaResultSetMapperFactory.mapperFor(JobUsageCountRow.class)).
                    fold(new HashMap<Table, Long>(), new JobUsageCountRow.CountFolder());
        } catch (Exception e) {
            log.error("getTables caught exception", e);
            return Collections.emptyMap();
        }
    }

    @Override
    public void markUsage(Table table)
    {}

    @Override
    public Duration window()
    {
        return duration;
    }
}
