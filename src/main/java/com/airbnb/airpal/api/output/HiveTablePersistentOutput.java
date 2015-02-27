package com.airbnb.airpal.api.output;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import static java.lang.String.format;

@Slf4j
@JsonTypeName("hive")
public class HiveTablePersistentOutput implements PersistentJobOutput
{
    private final UUID jobUUID;
    private final String tmpTableName;
    private final String destinationSchema;

    @Getter
    @Setter
    private URI location;

    public HiveTablePersistentOutput(UUID jobUUID,
                                     String tmpTableName,
                                     String destinationSchema)
    {
        this.jobUUID = jobUUID;
        this.tmpTableName = tmpTableName;
        try {
            this.location = new URI(format("%s.%s", destinationSchema, tmpTableName));
        }
        catch (URISyntaxException e) {
            log.error("Couldn't create hive output", e);
        }
        this.destinationSchema = destinationSchema;
    }

    @JsonCreator
    public HiveTablePersistentOutput(@JsonProperty("location") URI location,
                                     @JsonProperty("type") String type,
                                     @JsonProperty("description") String description)
    {
        this((UUID) null, null, null);
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
        String tableFqn = format("%s.%s", destinationSchema, tmpTableName);
        return format("CREATE TABLE %s AS %s", tableFqn, query);
    }
}
