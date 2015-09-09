package com.airbnb.shiro;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.Permission;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.ldap.UnsupportedAuthenticationMechanismException;
import org.apache.shiro.realm.ldap.JndiLdapContextFactory;
import org.apache.shiro.realm.ldap.JndiLdapRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.joda.time.Duration;

import javax.naming.AuthenticationNotSupportedException;
import javax.naming.NamingException;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;


@Slf4j
public class ExampleLDAPRealm extends JndiLdapRealm
{
    @Setter
    private List<UserGroup> groups = Collections.emptyList();
    private JndiLdapContextFactory lcf;
    private static String REALM_NAME = ExampleLDAPRealm.class.getSimpleName();

    public ExampleLDAPRealm()
    {
        this.setUserDnTemplate("Default DN template");
        lcf = new JndiLdapContextFactory();
        lcf.setSystemUsername("System username that will be used when creating an LDAP connection");
        lcf.setSystemPassword("System Password for the username used to create LDAP connection ");
        lcf.setAuthenticationMechanism("simple");
        lcf.setUrl("LDAP URL");
        this.setContextFactory(lcf);
    }

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
        return (token instanceof UsernamePasswordToken);
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
        UsernamePasswordToken usernamePasswordToken = (UsernamePasswordToken) token;

        try {
            queryForAuthenticationInfo(usernamePasswordToken, getContextFactory());
        } catch (AuthenticationNotSupportedException e) {
            throw new UnsupportedAuthenticationMechanismException("Unsupported configured authentication mechanism", e);
        } catch (javax.naming.AuthenticationException e) {
            throw new AuthenticationException("LDAP authentication failed.", e);
        } catch (NamingException e) {
            throw new AuthenticationException("LDAP naming error while attempting to authenticate user.", e);
        }

        return new SimpleAuthenticationInfo(token.getPrincipal(),
                token.getCredentials(),
                ExampleLDAPRealm.class.getSimpleName());
    }

}
