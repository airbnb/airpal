package com.airbnb.airpal.api.event;

import com.facebook.presto.client.QueryError;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.UUID;

@Data
public class JobOutputPersistenceEvent {
    public enum JobPersistenceStatus {
        COMPLETED,
        FAILED
    }

    @JsonProperty
    private final UUID jobUUID;
    @JsonProperty
    private final JobPersistenceStatus status;
    @JsonProperty
    private final QueryError queryError;
}
