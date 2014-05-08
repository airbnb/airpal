package com.airbnb.shiro;

import com.google.common.base.Charsets;
import com.google.common.collect.Sets;
import com.google.common.hash.Funnel;
import com.google.common.hash.Hashing;
import com.google.common.hash.PrimitiveSink;
import lombok.Getter;
import org.apache.shiro.authc.HostAuthenticationToken;
import org.apache.shiro.authc.RememberMeAuthenticationToken;
import org.joda.time.Duration;

import java.util.Set;

public class AllowAllToken
        implements RememberMeAuthenticationToken, HostAuthenticationToken
{
    private final boolean rememberMe;
    private final String host;
    @Getter
    private final String userName;
    @Getter
    private final Set<String> groups;
    @Getter
    private final String defaultSchema;
    @Getter
    private final Duration queryTimeout;
    @Getter
    private final String accessLevel;

    public AllowAllToken(String host,
            boolean rememberMe,
            String userName,
            Iterable<String> groups,
            String defaultSchema,
            Duration queryTimeout,
            String accessLevel)
    {
        this.host = host;
        this.rememberMe = rememberMe;
        this.userName = userName;
        this.groups = Sets.newHashSet(groups);
        this.defaultSchema = defaultSchema;
        this.queryTimeout = queryTimeout;
        this.accessLevel = accessLevel;
    }

    @Override
    public String getHost()
    {
        return host;
    }

    @Override
    public boolean isRememberMe()
    {
        return rememberMe;
    }

    @Override
    public Object getPrincipal()
    {
        return new AllowAllUser(getUserName(), getGroups(), getDefaultSchema(), getQueryTimeout(), getAccessLevel());
    }

    @Override
    public Object getCredentials()
    {
        AllowAllUser user = (AllowAllUser) getPrincipal();

        if (user != null) {
            return Hashing.sha256().hashObject(user, new Funnel<AllowAllUser>()
            {
                @Override
                public void funnel(AllowAllUser from, PrimitiveSink into)
                {
                    Set<String> fromGroups = from.getGroups();
                    String fromName = from.getUserName();

                    into.putString(fromName, Charsets.UTF_8);

                    for (String fromGroup : fromGroups) {
                        into.putString(fromGroup, Charsets.UTF_8);
                    }
                }
            });
        }

        return null;
    }
}
