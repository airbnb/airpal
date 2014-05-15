package com.airbnb.airpal.api.event;

import com.airbnb.airpal.api.Job;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class JobFinishedEvent implements JobEvent {
    @JsonProperty
    private final Job job;
}
