package com.airbnb.airpal.core;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.joda.time.Duration;
import org.secnod.shiro.jersey.TypeFactory;

import static java.lang.String.format;

public class AirpalUserFactory extends TypeFactory<AirpalUser>
{
    private final String defaultAccessLevel;
    private final String defaultSchema;
    private final Duration defaultQueryTimeout;

    public AirpalUserFactory(String defaultSchema, Duration queryTimeout, String accessLevel)
    {
        super(AirpalUser.class);
        this.defaultSchema = defaultSchema;
        this.defaultQueryTimeout = queryTimeout;
        this.defaultAccessLevel = accessLevel;
    }

    @Override
    public AirpalUser provide()
    {
        Subject subject = SecurityUtils.getSubject();
        Object principal = subject.getPrincipal();
        if (principal instanceof ToAirpalUser) {
            return ((ToAirpalUser)principal).toAirpalUser(subject);
        } else if (principal instanceof String) {
            return new AirpalUserImpl((String) principal, defaultSchema, defaultQueryTimeout, defaultAccessLevel, subject);
        } else if (principal instanceof AirpalUser) {
            return (AirpalUser) principal;
        } else {
            throw new IllegalArgumentException(format("Could not marshall %s to AirpalUser", principal));
        }
    }
}
