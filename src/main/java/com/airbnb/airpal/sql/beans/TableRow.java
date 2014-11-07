package com.airbnb.airpal.sql.beans;

import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Function;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import javax.annotation.Nullable;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import static com.google.inject.internal.util.$Preconditions.checkNotNull;

@Data
@AllArgsConstructor
public class TableRow
{
    private long id;
    private String connectorId;
    private String schema;
    private String table;
    private List<Column> columns;

    public static MapToTable MAP_TO_TABLE = new MapToTable();

    public static class MapToTable implements Function<TableRow, Table>
    {
        @Nullable
        @Override
        public Table apply(@Nullable TableRow input)
        {
            checkNotNull(input, "input was null");
            return new Table(input.getConnectorId(), input.getSchema(), input.getTable());
        }
    }

    @Slf4j
    public static class TableRowMapper implements ResultSetMapper<TableRow>
    {
        private final ObjectMapper objectMapper;
        private final TypeReference<List<Column>> columnTypeReference;

        public TableRowMapper(ObjectMapper objectMapper)
        {
            this.objectMapper = objectMapper;
            this.columnTypeReference = new TypeReference<List<Column>>() {};
        }

        @Override
        public TableRow map(int index, ResultSet r, StatementContext ctx)
                throws SQLException
        {
            try {
                return new TableRow(
                        r.getLong("id"),
                        r.getString("connector_id"),
                        r.getString("schema_"),
                        r.getString("table_"),
                        objectMapper.<List<Column>>readValue(r.getString("columns"), columnTypeReference));
            }
            catch (IOException e) {
                log.error("Caught exception mapping TableRow", e);
                return null;
            }
        }
    }
}
