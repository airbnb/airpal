package com.airbnb.airpal.presto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Function;
import com.google.common.base.Splitter;
import lombok.Getter;
import lombok.ToString;

import javax.annotation.Nullable;

import java.util.List;

@ToString
public class PartitionedTable extends Table
{
    private static Splitter TABLE_PART_SPLITTER = Splitter.on(".").omitEmptyStrings().trimResults();

    @Getter
    @JsonProperty
    private final String partitionName;

    protected PartitionedTable(@JsonProperty("connectorId") String connectorId,
                               @JsonProperty("schema") String schema,
                               @JsonProperty("table") String table,
                               @JsonProperty("partition") String partitionName,
                               @JsonProperty("columns") List<String> columns) {
        super(connectorId, schema, table, columns);
        this.partitionName = partitionName;
    }

    public PartitionedTable(String connectorId,
                            String schema,
                            String table,
                            String partitionName) {
        super(connectorId, schema, table);
        this.partitionName = partitionName;
    }

    public PartitionedTable(String connectorId,
                            String schema,
                            String table) {
        this(connectorId,
             schema,
             table,
             null);
    }

    public PartitionedTable withPartitionName(String partitionName)
    {
        return new PartitionedTable(getConnectorId(),
                                    getSchema(),
                                    getTable(),
                                    partitionName,
                                    getColumns());
    }

    public static PartitionedTable fromTable(Table table)
    {
        return new PartitionedTable(table.getConnectorId(),
                                    table.getSchema(),
                                    table.getTable(),
                                    null,
                                    table.getColumns());
    }

    public Table asTable()
    {
        return new Table(getConnectorId(),
                         getSchema(),
                         getTable(),
                         getColumns());
    }

    @Override
    public int hashCode()
    {
        return getConnectorId().hashCode() +
                getSchema().hashCode() +
                getTable().hashCode() +
                ((getTable() == null) ? 0 : getTable().hashCode());
    }

    @Override
    public boolean equals(Object obj)
    {
        if (obj instanceof PartitionedTable) {
            PartitionedTable otherTable = (PartitionedTable) obj;

            return getConnectorId().equals(otherTable.getConnectorId()) &&
                    getSchema().equals(otherTable.getSchema()) &&
                    getTable().equals(otherTable.getTable()) &&
                    partitionsSame(partitionName, otherTable.getPartitionName());
        } else {
            return false;
        }
    }

    public static boolean partitionsSame(String partition1, String partition2)
    {
        if ((partition1 == null) && (partition2 == null)) {
            return true;
        } else if (((partition1 == null) && (partition2 != null))
                || ((partition1 != null) && (partition2 == null))) {
            return false;
        } else {
            return partition1.equals(partition2);
        }
    }

    public static PartitionedTable valueOf(String s)
    {
        List<String> parts = TABLE_PART_SPLITTER.splitToList(s);

        if (parts.size() == 4) {
            // String of the form hive.default.request_search.d=2013-11-20
            return new PartitionedTable(parts.get(0), parts.get(1), parts.get(2), parts.get(3));
        } else if (parts.size() == 3) {
            // String of the form hive.default.request_search
            return new PartitionedTable(parts.get(0), parts.get(1), parts.get(2));
        } else if (parts.size() == 2) {
            // String of the form default.request_search
            return new PartitionedTable("hive", parts.get(0), parts.get(1));
        } else {
            throw new IllegalArgumentException("Table identifier parts not found.");
        }
    }

    public static class PartitionedTableToTable implements Function<PartitionedTable, Table>
    {
        @Nullable
        @Override
        public Table apply(PartitionedTable input)
        {
            return input;
        }
    }
}
