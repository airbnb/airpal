package com.airbnb.airpal.core;

import lombok.Value;
import org.apache.shiro.subject.Subject;
import org.joda.time.Duration;

@Value
public class AirpalUserImpl implements AirpalUser
{
    private final String userName;
    private final String defaultSchema;
    private final Duration queryTimeout;
    private final String accessLevel;
    private final Subject subject;

    @Override
    public boolean isPermitted(String permission)
    {
        return subject.isPermitted(permission);
    }
}
