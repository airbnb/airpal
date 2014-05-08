package com.airbnb.shiro;

import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListenerAdapter;

@Slf4j
public class SessionListenerLogger extends SessionListenerAdapter
{
    @Override
    public void onStart(Session session)
    {
        log.warn("Saw START of Session: [{}]", session.toString());
    }

    @Override
    public void onStop(Session session)
    {
        log.warn("Saw STOP of Session: [{}]", session.toString());
    }

    @Override
    public void onExpiration(Session session)
    {
        log.warn("Saw EXPIRATION of Session: [{}]", session.toString());
    }
}
