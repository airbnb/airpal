package com.airbnb.airpal.core;

import org.joda.time.Duration;

public interface AirpalUser
{
    public String getUserName();
    public String getDefaultSchema();
    public Duration getQueryTimeout();
    public String getAccessLevel();

    public boolean isPermitted(String permission);
}
