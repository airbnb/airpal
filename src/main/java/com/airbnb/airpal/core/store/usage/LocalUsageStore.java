package com.airbnb.airpal.core.store.usage;

import com.airbnb.airpal.presto.Table;
import com.codahale.metrics.Histogram;
import com.codahale.metrics.SlidingTimeWindowReservoir;
import com.google.common.collect.Maps;
import io.dropwizard.util.Duration;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RequiredArgsConstructor
public class LocalUsageStore implements UsageStore
{
    private final Map<Table, Histogram> usageMap = Maps.newHashMap();
    private final Duration usageTrackTime;

    @Override
    public long getUsages(Table table)
    {
        final Histogram window = usageMap.get(table);

        if (window != null)
            return window.getSnapshot().size();
        else
            return 0l;
    }

    @Override
    public Map<Table, Long> getUsages(Iterable<Table> tables) {
        return null;
    }

    @Override
    public void markUsage(Table table)
    {
        Histogram window = usageMap.get(table);

        if (window == null) {
            final SlidingTimeWindowReservoir reservoir = new SlidingTimeWindowReservoir(
                    usageTrackTime.getQuantity(),
                    usageTrackTime.getUnit());
            window = new Histogram(reservoir);
            usageMap.put(table, window);
        }

        window.update(1);
    }

    @Override
    public Duration window() {
        return usageTrackTime;
    }
}
