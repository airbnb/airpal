package com.airbnb.airpal.sql.beans;

import com.airbnb.airpal.presto.Table;
import lombok.Data;
import org.skife.jdbi.v2.FoldController;
import org.skife.jdbi.v2.Folder3;
import org.skife.jdbi.v2.StatementContext;

import java.sql.SQLException;
import java.util.Map;

@Data
public class JobUsageCountRow
{
    private long count;
    private String connectorId;
    private String schema;
    private String table;

    public Table toTable()
    {
        return new Table(getConnectorId(), getSchema(), getTable());
    }

    public static class CountFolder implements Folder3<Map<Table, Long>, JobUsageCountRow>
    {
        @Override
        public Map<Table, Long> fold(Map<Table, Long> accumulator, JobUsageCountRow rs, FoldController control, StatementContext ctx)
                throws SQLException
        {
            Table table = rs.toTable();
            long currentCount = accumulator.containsKey(table) ? accumulator.get(table) : 0;
            accumulator.put(table, currentCount + rs.getCount());

            return accumulator;
        }
    }
}
