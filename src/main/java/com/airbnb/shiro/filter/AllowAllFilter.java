package com.airbnb.shiro.filter;

import com.airbnb.shiro.AllowAllToken;
import com.airbnb.shiro.UserGroup;
import com.google.common.collect.ImmutableSet;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.session.Session;
import org.apache.shiro.web.filter.authc.AuthenticatingFilter;
import org.apache.shiro.web.util.WebUtils;
import org.joda.time.Duration;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.List;

@Slf4j
public class AllowAllFilter
        extends AuthenticatingFilter
{
    public static final String JSESSIONID = "JSESSIONID";

    @Setter
    private List<UserGroup> groups = Collections.emptyList();

    public AllowAllFilter() {}

    @Override
    protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) throws Exception
    {
        log.info("createToken called");
        return new AllowAllToken(request.getRemoteHost(), true, "anonymous", ImmutableSet.of("all"), "default", Duration.standardHours(1), "default");
    }

    @Override
    protected boolean executeLogin(ServletRequest request, ServletResponse response)
            throws Exception
    {
        return super.executeLogin(request, response);
    }

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception
    {
        log.info("onAccessDenied called");

        return executeLogin(request, response);
    }

    private boolean userIsLoggedIn()
    {
        Session session = SecurityUtils.getSubject().getSession(false);
        return (session != null);
    }

    private void redirectToInternalLogin(ServletRequest request, ServletResponse response) throws IOException
    {
        Cookie sessionCookie = new Cookie(JSESSIONID, "");

        sessionCookie.setMaxAge(0);

        HttpServletResponse httpResponse = WebUtils.toHttp(response);
        httpResponse.addCookie(sessionCookie);

        WebUtils.issueRedirect(request,
                               response,
                               getLoginUrl(),
                               Collections.emptyMap(),
                               !(URI.create(getLoginUrl()).isAbsolute()));
    }
}
