package com.airbnb.airpal.presto;

import com.facebook.presto.client.ClientSession;

import javax.inject.Provider;

import java.net.URI;
import java.util.Locale;
import java.util.TimeZone;

public class ClientSessionFactory
{
    private final boolean debug;
    private final String defaultSchema;
    private final String catalog;
    private final String source;
    private final String user;
    private final Provider<URI> server;
    private final String timeZoneId;
    private final Locale locale;

    public ClientSessionFactory(Provider<URI> server, String user, String source, String catalog, String defaultSchema, boolean debug)
    {
        this.server = server;
        this.user = user;
        this.source = source;
        this.catalog = catalog;
        this.defaultSchema = defaultSchema;
        this.debug = debug;
        this.timeZoneId = TimeZone.getTimeZone("UTC").getID();
        this.locale = Locale.getDefault();
    }

    public ClientSession create(String schema)
    {
        return new ClientSession(server.get(),
                user,
                source,
                catalog,
                schema,
                timeZoneId,
                locale,
                debug);
    }

    public ClientSession create()
    {
        return new ClientSession(server.get(),
                user,
                source,
                catalog,
                defaultSchema,
                timeZoneId,
                locale,
                debug);
    }
}
