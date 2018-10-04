package com.airbnb.airpal.resources;

import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.store.usage.UsageStore;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.presto.Table;
import com.airbnb.airpal.presto.hive.HivePartition;
import com.airbnb.airpal.presto.metadata.ColumnCache;
import com.airbnb.airpal.presto.metadata.PreviewTableCache;
import com.airbnb.airpal.presto.metadata.SchemaCache;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Optional;
import com.google.common.base.Predicate;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import io.dropwizard.util.Duration;
import lombok.Data;
import lombok.NonNull;
import org.joda.time.DateTime;
import org.secnod.shiro.jaxrs.Auth;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static com.airbnb.airpal.core.AuthorizationUtil.isAuthorizedRead;
import static com.airbnb.airpal.presto.hive.HivePartition.HivePartitionItem;
import static java.lang.String.format;

@Path("/api/table")
public class TablesResource
{
    private final SchemaCache schemaCache;
    private final ColumnCache columnCache;
    private final PreviewTableCache previewTableCache;
    private final UsageStore usageStore;
    private final String defaultCatalog;

    @Inject
    public TablesResource(
            final SchemaCache schemaCache,
            final ColumnCache columnCache,
            final PreviewTableCache previewTableCache,
            final UsageStore usageStore,
            @Named("default-catalog") final String defaultCatalog)
    {
        this.schemaCache = schemaCache;
        this.columnCache = columnCache;
        this.previewTableCache = previewTableCache;
        this.usageStore = usageStore;
        this.defaultCatalog = defaultCatalog;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTableUpdates(
            @Auth AirpalUser user,
            @QueryParam("catalog") String providedCatalog)
    {
        final String catalog = (providedCatalog != null) ? providedCatalog : defaultCatalog;
        final Map<String, List<String>> schemaMap = schemaCache.getSchemaMap(catalog);
        final ImmutableList.Builder<Table> builder = ImmutableList.builder();

        for (Map.Entry<String, List<String>> entry : schemaMap.entrySet()) {
            String schema = entry.getKey();
            for (String table : entry.getValue()) {
                if (isAuthorizedRead(user, catalog, schema, table)) {
                    builder.add(new Table(catalog, schema, table));
                }
            }
        }

        final List<Table> tables = builder.build();
        final Map<Table, Long> allUsages = usageStore.getUsages(tables);
        final Map<PartitionedTable, DateTime> updateMap = Collections.emptyMap();

        return Response.ok(createTablesWithMetaData(tables, allUsages, updateMap)).build();
    }

    // TODO: Make getTableColumns, getTablePartitions and getTablePreview take a 3rd path parameter for catalog
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{schema}/{tableName}/columns")
    public Response getTableColumns(
            @Auth AirpalUser user,
            @PathParam("schema") String schema,
            @PathParam("tableName") String tableName)
            throws ExecutionException
    {
        if (isAuthorizedRead(user, defaultCatalog, schema, tableName)) {
            return Response.ok(columnCache.getColumns(schema, tableName)).build();
        }
        else {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{schema}/{tableName}/partitions")
    public Response getTablePartitions(
            @Auth AirpalUser user,
            @PathParam("schema") String schema,
            @PathParam("tableName") String tableName)
            throws ExecutionException
    {
        if (isAuthorizedRead(user, defaultCatalog, schema, tableName)) {
            return Response.ok(getPartitionsWithMetaData(new PartitionedTable("hive", schema, tableName))).build();
        }
        else {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{schema}/{tableName}/preview")
    public Response getTablePreview(
            @Auth AirpalUser user,
            @PathParam("schema") String schema,
            @PathParam("tableName") String tableName,
            @QueryParam("connectorId") String connectorId,
            @QueryParam("partitionName") final String partitionName,
            @QueryParam("partitionValue") String partitionValue)
            throws ExecutionException
    {
        List<HivePartition> partitions = columnCache.getPartitions(schema, tableName);

        Optional<HivePartition> partition = FluentIterable.from(partitions).firstMatch(
                new Predicate<HivePartition>()
                {
                    @Override
                    public boolean apply(HivePartition input)
                    {
                        return Objects.equals(input.getName(), partitionName);
                    }
                });

        if (isAuthorizedRead(user, defaultCatalog, schema, tableName)) {
            return Response.ok(previewTableCache.getPreview(
                    Optional.fromNullable(connectorId).or(defaultCatalog),
                    schema,
                    tableName,
                    partition,
                    partitionValue)).build();
        }
        else {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }

    @Data
    public static class PartitionedTableWithMetaData
    {
        @JsonProperty
        private final String schema;
        @JsonProperty
        private final String tableName;
        @JsonProperty
        private final String partition;
        @JsonProperty
        private final String fqn;
        @JsonProperty
        private final long usages;
        @JsonProperty
        private final int windowCount;
        @JsonProperty
        private final TimeUnit windowUnit;
        @JsonProperty
        private final DateTime lastUpdated;

        public static PartitionedTableWithMetaData fromTable(final Table table,
                final long usages,
                final TimeUnit windowUnit,
                final int windowCount,
                final DateTime lastUpdated)
        {
            return fromPartionedTable(PartitionedTable.fromTable(table),
                    usages,
                    windowUnit,
                    windowCount,
                    lastUpdated);
        }

        public static PartitionedTableWithMetaData fromPartionedTable(final PartitionedTable table,
                final long usages,
                final TimeUnit windowUnit,
                final int windowCount,
                final DateTime lastUpdated)
        {
            return new PartitionedTableWithMetaData(table.getSchema(),
                    table.getTable(),
                    table.getPartitionName(),
                    format("%s.%s", table.getSchema(), table.getTable()),
                    usages,
                    windowCount,
                    windowUnit,
                    lastUpdated);
        }
    }

    private List<PartitionedTableWithMetaData> createTablesWithMetaData(
            @NonNull final List<Table> tables,
            @NonNull final Map<Table, Long> tableUsageMap,
            @NonNull final Map<PartitionedTable, DateTime> tableUpdateMap)
    {
        final ImmutableList.Builder<PartitionedTableWithMetaData> builder = ImmutableList.builder();
        final Duration usageWindow = usageStore.window();

        for (Table table : tables) {
            PartitionedTable partitionedTable = PartitionedTable.fromTable(table);
            DateTime updatedAt = tableUpdateMap.get(partitionedTable);

            long lastUsage = 0;
            if (tableUsageMap.containsKey(table)) {
                lastUsage = tableUsageMap.get(table);
            }

            builder.add(PartitionedTableWithMetaData.fromTable(
                    table,
                    lastUsage,
                    usageWindow.getUnit(),
                    (int) usageWindow.getQuantity(),
                    updatedAt
            ));
        }

        return builder.build();
    }

    private List<HivePartitionItem> getPartitionsWithMetaData(PartitionedTable table)
            throws ExecutionException
    {
        List<HivePartition> partitions = columnCache.getPartitions(table.getSchema(), table.getTable());
        ImmutableList.Builder<HivePartitionItem> partitionItems = ImmutableList.builder();

        for (HivePartition partition : partitions) {
            for (Object value : partition.getValues()) {
                PartitionedTable partitionedTable = table.withPartitionName(
                        HivePartition.getPartitionId(partition.getName(), value));
                DateTime updatedAt = null;

                partitionItems.add(new HivePartitionItem(partition.getName(), partition.getType(), value, updatedAt));
            }
        }

        return partitionItems.build();
    }
}
