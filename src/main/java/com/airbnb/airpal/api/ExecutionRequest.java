package com.airbnb.airpal.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

public class ExecutionRequest
{
    @Getter
    @JsonProperty
    private final String query;
    @Getter
    @JsonProperty
    private final String tmpTable;

    @JsonCreator
    public ExecutionRequest(@JsonProperty("query") final String query,
                            @JsonProperty("tmpTable") final String tmpTable) {
        this.query = query;
        this.tmpTable = tmpTable;
    }
}
