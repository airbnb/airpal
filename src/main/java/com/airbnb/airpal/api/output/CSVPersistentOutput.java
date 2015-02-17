package com.airbnb.airpal.api.output;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Getter;
import lombok.Setter;

import java.net.URI;

@JsonTypeName("csv")
public class CSVPersistentOutput implements PersistentJobOutput
{
    @Getter
    @Setter
    private URI location;
    @Getter
    private final String type;
    @Getter
    private final String description;

    @JsonCreator
    public CSVPersistentOutput(
            @JsonProperty("location") URI location,
            @JsonProperty("type") String type,
            @JsonProperty("description") String description)
    {
        this.location = location;
        this.type = type;
        this.description = description;
    }

    @Override
    public String processQuery(String query)
    {
        return query;
    }
}
