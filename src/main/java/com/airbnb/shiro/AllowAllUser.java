package com.airbnb.shiro;

import com.airbnb.airpal.core.AirpalUser;
import lombok.Data;
import org.joda.time.Duration;

import java.io.Serializable;
import java.util.Set;

@Data
public class AllowAllUser
        implements AirpalUser, Serializable
{
    private static final long serialVersionUID = 2138145047434723791L;

    private final String userName;
    private final Set<String> groups;
    private final String defaultSchema;
    private final Duration queryTimeout;
    private final String accessLevel;

    @Override
    public boolean isPermitted(String permission)
    {
        return true;
    }
}