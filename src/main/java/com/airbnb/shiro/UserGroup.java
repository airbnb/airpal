package com.airbnb.shiro;

import com.google.common.collect.ImmutableSet;
import lombok.Getter;
import lombok.Setter;
import org.apache.shiro.authz.Permission;
import org.apache.shiro.authz.permission.WildcardPermission;
import org.joda.time.Duration;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class UserGroup
{
    @Getter @Setter
    private String defaultConnector;

    @Getter @Setter
    private String defaultSchema;

    @Getter
    private Set<Permission> permissions = Collections.emptySet();

    @Setter
    private Set<String> groups = Collections.emptySet();

    @Setter
    private String timeout;

    private Duration queryTimeout;

    @Getter @Setter
    private String accessLevel;

    public boolean representedByGroupStrings(Collection<String> groups)
    {
        for (String group : groups) {
            if (this.representedByGroupString(group)) {
                return true;
            }
        }

        return false;
    }

    public boolean representedByGroupString(String group)
    {
        return this.groups.contains(group);
    }

    public void setPermissions(Set<String> permissions)
    {
        ImmutableSet.Builder<Permission> builder = ImmutableSet.builder();
        for (String permission : permissions) {
            builder.add(new WildcardPermission(permission));
        }

        this.permissions = builder.build();
    }

    public Duration getQueryTimeout()
    {
        if (queryTimeout == null) {
            io.dropwizard.util.Duration duration = io.dropwizard.util.Duration.parse(timeout);
            queryTimeout = Duration.millis(duration.toMilliseconds());
        }

        return queryTimeout;
    }
}
