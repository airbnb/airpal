package com.airbnb.airpal.sql;

import com.airbnb.airpal.presto.Table;
import com.google.common.base.Joiner;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static java.lang.String.format;

public class Util
{
    private static Joiner OR_JOINER = Joiner.on(" OR ").skipNulls();
    private static Joiner DOT_JOINER = Joiner.on(".").skipNulls();

    public static String getTableCondition(List<Table> tables)
    {
        return getTableCondition(null, tables);
    }

    public static String getTableCondition(String alias, List<Table> tables)
    {
        Set<String> tablesUsedByQuery = new HashSet<>(tables.size());
        for (Table table : tables) {
            tablesUsedByQuery.add(
                    format("(connector_id = \"%s\" AND schema_ = \"%s\" AND table_ = \"%s\")",
                            DOT_JOINER.join(alias, table.getConnectorId()),
                            DOT_JOINER.join(alias, table.getSchema()),
                            DOT_JOINER.join(alias, table.getTable())));
        }

        return OR_JOINER.join(tablesUsedByQuery);
    }
}
