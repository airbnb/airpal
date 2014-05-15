package com.airbnb.airpal.core;

import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.Table;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Map;

public interface TableUpdatedCache
{
    public DateTime get(Table table);
    public Map<PartitionedTable, DateTime> getAllPresent(List<? extends Table> tables);
    public Map<PartitionedTable, DateTime> getAll(List<Table> tables);
}
