package com.airbnb.airpal.sql.jdbi;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.Argument;
import org.skife.jdbi.v2.tweak.ArgumentFactory;

import java.net.URI;

public class URIArgumentFactory implements ArgumentFactory<URI>
{
    @Override
    public boolean accepts(Class<?> expectedType, Object value, StatementContext ctx)
    {
        return value instanceof URI;
    }

    @Override
    public Argument build(Class<?> expectedType, URI value, StatementContext ctx)
    {
        return new URIArgument(value);
    }
}
