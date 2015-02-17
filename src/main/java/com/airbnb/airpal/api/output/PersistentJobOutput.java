package com.airbnb.airpal.api.output;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.net.URI;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
public interface PersistentJobOutput
{
    public String getType();

    public String getDescription();

    public URI getLocation();
    public void setLocation(URI location);

    public String processQuery(String query);
}
