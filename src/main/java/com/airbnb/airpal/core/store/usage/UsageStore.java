package com.airbnb.airpal.core.store.usage;

import com.airbnb.airpal.presto.Table;
import io.dropwizard.util.Duration;

import java.util.Map;

public interface UsageStore
{
    long getUsages(Table table);

    Map<Table, Long> getUsages(Iterable<Table> tables);

    void markUsage(Table table);

    Duration window();
}
