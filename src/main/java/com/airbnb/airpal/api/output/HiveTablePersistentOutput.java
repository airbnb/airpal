package com.airbnb.airpal.api.output;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.core.Persistor;
import com.airbnb.airpal.core.execution.ExecutionAuthorizer;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.client.Column;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Getter;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import static java.lang.String.format;

@JsonTypeName("hive")
public class HiveTablePersistentOutput implements PersistentJobOutput
{
    private final UUID jobUUID;
    private final String tmpTableName;

    @Getter
    private URI location;

    public HiveTablePersistentOutput(UUID jobUUID,
                                     String tmpTableName)
    {
        this.jobUUID = jobUUID;
        this.tmpTableName = tmpTableName;
    }

    @JsonCreator
    public HiveTablePersistentOutput(@JsonProperty("location") URI location,
                                     @JsonProperty("type") String type,
                                     @JsonProperty("description") String description)
    {
        this((UUID) null, null);
        this.location = location;
    }

    @Override
    public String getType()
    {
        return "hive";
    }

    @Override
    public String getDescription()
    {
        return null;
    }

    @Override
    public String processQuery(String query)
    {
        String tableFqn = format("airpal.%s", tmpTableName);
        return format("CREATE TABLE %s AS %s", tableFqn, query);
    }

    @Override
    public Persistor getPersistor(final Job job)
    {
        final String tableFqn = format("airpal.%s", tmpTableName);

        return new Persistor() {
            @Override
            public void onColumns(List<Column> columns)
            {}

            @Override
            public void onData(Iterable<List<Object>> data)
            {}

            @Override
            public void persist()
            {
                location = URI.create(tableFqn);
            }

            @Override
            public boolean canPersist(ExecutionAuthorizer authorizer)
            {
                return authorizer.isAuthorizedWrite("hive", "airpal", tmpTableName);
            }
        };
    }
}
