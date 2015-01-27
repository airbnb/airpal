package com.airbnb.airpal.api.output;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Getter;
import lombok.Setter;

import java.net.URI;
import java.util.UUID;

import static java.lang.String.format;

@JsonTypeName("hive")
public class HiveTablePersistentOutput implements PersistentJobOutput
{
    private final UUID jobUUID;
    private final String tmpTableName;

    @Getter
    @Setter
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
}
