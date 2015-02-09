package com.airbnb.airpal.core.store.usage;

import com.airbnb.airpal.presto.Table;
import io.dropwizard.util.Duration;

import java.util.Map;

public interface UsageStore
{
    public long getUsages(Table table);

    public Map<Table, Long> getUsages(Iterable<Table> tables);

    public void markUsage(Table table);

    public Duration window();
}
