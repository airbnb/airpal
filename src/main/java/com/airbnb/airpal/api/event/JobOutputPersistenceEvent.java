package com.airbnb.airpal.api.event;

import com.facebook.presto.client.QueryError;
import lombok.Data;

import java.util.UUID;

@Data
public class JobOutputPersistenceEvent {
    public enum JobPersistenceStatus {
        COMPLETED,
        FAILED
    }

    private final UUID jobUUID;
    private final JobPersistenceStatus status;
    private final QueryError queryError;
}
