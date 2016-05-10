package com.airbnb.airpal.sql;

import com.airbnb.airpal.presto.Table;
import com.google.common.base.Joiner;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import java.util.HashSet;
import java.util.Set;

import static java.lang.String.format;

public class Util
{
    private static Joiner OR_JOINER = Joiner.on(" OR ").skipNulls();
    private static Joiner DOT_JOINER = Joiner.on(".").skipNulls();

    public static String getTableCondition(Iterable<Table> tables)
    {
        return getTableCondition(null, tables);
    }

    public static String getTableCondition(String alias, Iterable<Table> tables)
    {
        Set<String> tablesUsedByQuery = new HashSet<>(Iterables.size(tables));
        for (Table table : tables) {
            tablesUsedByQuery.add(
                    format("(connector_id = '%s' AND schema_ = '%s' AND table_ = '%s')",
                            DOT_JOINER.join(alias, table.getConnectorId()),
                            DOT_JOINER.join(alias, table.getSchema()),
                            DOT_JOINER.join(alias, table.getTable())));
        }

        return OR_JOINER.join(tablesUsedByQuery);
    }

    public static String getQueryFinishedCondition(DbType type)
    {
        if (type == DbType.H2) {
            return "query_finished > DATEADD('DAY', -:day_interval, CURRENT_TIMESTAMP())";
        } else {
            return "query_finished > DATE_SUB(UTC_TIMESTAMP(), INTERVAL :day_interval day)";
        }
    }
}
