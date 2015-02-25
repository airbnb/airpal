package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.hive.HivePartition;
import com.google.common.base.Optional;
import lombok.Value;

@Value
public class PartitionedTableWithValue
{
    private final Table table;
    private final Optional<HivePartition> partition;
    private final String value;
}
