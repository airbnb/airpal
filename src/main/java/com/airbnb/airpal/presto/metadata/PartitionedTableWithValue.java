package com.airbnb.airpal.presto.metadata;

import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.hive.HivePartition;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Optional;
import lombok.Value;

@Value
public class PartitionedTableWithValue
{
    @JsonProperty
    private final Table table;
    @JsonProperty
    private final Optional<HivePartition> partition;
    @JsonProperty
    private final String value;
}
