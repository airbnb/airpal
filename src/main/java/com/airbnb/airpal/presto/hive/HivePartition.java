package com.airbnb.airpal.presto.hive;

import com.facebook.presto.client.Column;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;
import lombok.Getter;
import org.joda.time.DateTime;

import javax.annotation.concurrent.Immutable;
import java.util.List;

import static java.lang.String.format;

@Immutable
public class HivePartition extends Column
{
    private final List<Object> values;

    @JsonProperty
    public List<Object> getValues() {
        return values;
    }

    @JsonCreator
    public HivePartition(@JsonProperty("name") String name,
                         @JsonProperty("type") String type,
                         @JsonProperty("values") List<Object> values) {
        super(name, type);
        this.values = values;
    }

    public static HivePartition fromColumn(Column column, List<Object> values) {
        return new HivePartition(column.getName(), column.getType(), values);
    }

    public static List<String> getPartitionIds(HivePartition partition)
    {
        ImmutableList.Builder<String> partitionIdBuilder = ImmutableList.builder();
        String partitionName = partition.getName();

        for (Object value : partition.getValues()) {
            partitionIdBuilder.add(getPartitionId(partitionName, value));
        }

        return partitionIdBuilder.build();
    }

    public static String getPartitionId(String partitionName, Object partitionValue)
    {
        return format("%s=%s", partitionName, partitionValue.toString());
    }

    public static class HivePartitionItem
    {
        @JsonProperty
        @Getter
        private final Object value;
        @JsonProperty
        @Getter
        private final String type;
        @JsonProperty
        @Getter
        private final String name;
        @JsonProperty
        @Getter
        private final DateTime lastUpdated;

        @JsonCreator
        public HivePartitionItem(@JsonProperty("name") String name,
                                 @JsonProperty("type") String type,
                                 @JsonProperty("value") Object value,
                                 @JsonProperty("lastUpdated") DateTime lastUpdated)
        {
            this.name = name;
            this.type = type;
            this.value = value;
            this.lastUpdated = lastUpdated;
        }
    }

}
