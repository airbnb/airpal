package com.airbnb.shiro;

import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import lombok.Setter;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.Permission;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class AllowAllRealm
        extends AuthorizingRealm
{
    private static String REALM_NAME = AllowAllRealm.class.getSimpleName();

    @Setter
    private List<UserGroup> groups = Collections.emptyList();

    @Override
    public void setName(String name)
    {}

    @Override
    public String getName()
    {
        return REALM_NAME;
    }

    @Override
    public boolean supports(AuthenticationToken token)
    {
        return (token instanceof AllowAllToken);
    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals)
    {
        Set<String> roles = Sets.newHashSet("user");
        Set<Permission> permissions = Sets.newHashSet();
        Collection<AllowAllUser> principalsCollection = principals.byType(AllowAllUser.class);

        if (principalsCollection.isEmpty()) {
            throw new AuthorizationException("No principals!");
        }

        for (AllowAllUser user : principalsCollection) {
            for (UserGroup userGroup : groups) {
                if (userGroup.representedByGroupStrings(user.getGroups())) {
                    permissions.addAll(userGroup.getPermissions());
                    break;
                }
            }
        }

        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo(roles);
        authorizationInfo.setObjectPermissions(permissions);

        return authorizationInfo;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException
    {
        if (!(token instanceof AllowAllToken)) {
            throw new AuthenticationException("Incorrect token provided");
        }

        AllowAllToken authToken = (AllowAllToken) token;

        if (Strings.isNullOrEmpty(authToken.getUserName())) {
            throw new AuthenticationException("No valid username");
        } else if ((authToken.getGroups() == null) || authToken.getGroups().isEmpty()) {
            throw new AuthenticationException("No valid groups");
        }

        return new SimpleAuthenticationInfo(authToken.getPrincipal(),
                                            authToken.getCredentials(),
                                            REALM_NAME);
    }
}
