package com.airbnb.airpal.sql.dao;

import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.sql.Util;
import com.airbnb.airpal.sql.beans.TableRow;
import com.hubspot.rosetta.jdbi.RosettaBinder;
import lombok.extern.slf4j.Slf4j;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlBatch;
import org.skife.jdbi.v2.sqlobject.mixins.GetHandle;

import java.util.Collections;
import java.util.List;

import static java.lang.String.format;

@Slf4j
public abstract class TableDAO
        implements GetHandle
{
    @SqlBatch(
            "INSERT INTO tables (connector_id, schema_, table_, columns) " +
            "VALUES (:connectorId, :schema, :table, :columns)")
    @GetGeneratedKeys
    public abstract void createTables(@RosettaBinder Iterable<Table> tables);

    public List<TableRow> getTables(List<Table> tables)
    {
        try (Handle handle = getHandle()) {
            return handle
                    .createQuery(format("SELECT * FROM tables WHERE %s", Util.getTableCondition(tables)))
                    .mapTo(TableRow.class)
                    .list();
        } catch (Exception e) {
            log.error("getTables caught exception", e);
            return Collections.emptyList();
        }
    }
}
