package com.airbnb.airpal.core;

import org.joda.time.Duration;

import java.util.Set;

/**
 * Author: @andykram
 */
public interface AirpalUser
{
    public String getUserName();
    public String getDefaultSchema();
    public Set<String> getGroups();
    public Duration getQueryTimeout();
    public String getAccessLevel();
}
