package com.airbnb.airpal.api.event;

import com.airbnb.airpal.api.Job;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.net.URI;
import java.util.List;

@Data
public class JobUpdateEvent implements JobEvent {
    @JsonProperty
    private final Job job;
    @JsonProperty
    private final List<List<Object>> sample;
}
