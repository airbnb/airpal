package com.airbnb.airpal.api.output;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.net.URI;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
public interface PersistentJobOutput
{
    String getType();

    String getDescription();

    URI getLocation();
    void setLocation(URI location);

    String processQuery(String query);
}
