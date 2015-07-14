package com.airbnb.airpal.core;

import org.joda.time.Duration;

public interface AirpalUser
{
    String getUserName();
    String getDefaultSchema();
    Duration getQueryTimeout();
    String getAccessLevel();

    boolean isPermitted(String permission);
}
