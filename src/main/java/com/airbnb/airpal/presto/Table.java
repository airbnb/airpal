package com.airbnb.airpal.presto;

import com.facebook.presto.execution.Column;
import com.facebook.presto.execution.Input;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.hubspot.rosetta.StoredAsJson;
import lombok.Data;
import lombok.ToString;

import javax.annotation.concurrent.Immutable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static com.google.common.base.Preconditions.checkNotNull;

@ToString
@Data
@Immutable
@JsonIgnoreProperties(ignoreUnknown = true)
public class Table
{
    private static Splitter TABLE_PART_SPLITTER = Splitter.on(".").omitEmptyStrings().trimResults();
    private static Joiner TABLE_PART_JOINER = Joiner.on(".").skipNulls();

    private final String connectorId;
    private final String schema;
    private final String table;
    @StoredAsJson
    private final ImmutableList<String> columns;

    @JsonCreator
    protected Table(@JsonProperty("connectorId") String connectorId,
            @JsonProperty("schema") String schema,
            @JsonProperty("table") String table,
            @JsonProperty("columns") List<String> columns)
    {
        this.connectorId = checkNotNull(connectorId, "connectorId is null");
        this.schema = checkNotNull(schema, "schema is null");
        this.table = checkNotNull(table, "table is null");
        this.columns = ImmutableList.copyOf(checkNotNull(columns, "columns is null"));
    }

    public Table(String connectorId,
            String schema,
            String table)
    {
        this(connectorId, schema, table, Collections.<String>emptyList());
    }

    public static Table valueOf(String s)
    {
        List<String> parts = TABLE_PART_SPLITTER.splitToList(s);

        if (parts.size() == 3) {
            return new Table(parts.get(0), parts.get(1), parts.get(2));
        }
        else if (parts.size() == 2) {
            return new Table("hive", parts.get(0), parts.get(1));
        }
        else {
            throw new IllegalArgumentException("Table identifier parts not found.");
        }
    }

    public static Table fromInput(Input input)
    {
        List<String> columns = new ArrayList<>(input.getColumns().size());

        for (Column c : input.getColumns()) {
            columns.add(c.getName());
        }

        return new Table(input.getConnectorId(), input.getSchema(), input.getTable(), columns);
    }

    @JsonProperty("fqn")
    public String getFqn()
    {
        return TABLE_PART_JOINER.join(getConnectorId(), getSchema(), getTable());
    }

    @Override
    public int hashCode()
    {
        int result = getConnectorId().hashCode();
        result = 31 * result + getSchema().hashCode();
        result = 31 * result + getTable().hashCode();
        return result;
    }

    @Override
    public boolean equals(Object obj)
    {
        if (obj == this) {
            return true;
        }

        if (obj == null) {
            return false;
        }

        if (obj instanceof Input) {
            Input other = (Input)obj;

            return getConnectorId().equals(other.getConnectorId()) &&
                    getSchema().equals(other.getSchema()) &&
                    getTable().equals(other.getTable());
        } else if (obj instanceof Table) {
            Table other = (Table)obj;

            return getConnectorId().equals(other.getConnectorId()) &&
                    getSchema().equals(other.getSchema()) &&
                    getTable().equals(other.getTable());
        }

        return false;
    }
}
