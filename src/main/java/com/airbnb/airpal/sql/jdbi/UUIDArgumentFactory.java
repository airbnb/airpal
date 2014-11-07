package com.airbnb.airpal.sql.jdbi;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.Argument;
import org.skife.jdbi.v2.tweak.ArgumentFactory;

import java.util.UUID;

public class UUIDArgumentFactory implements ArgumentFactory<UUID>
{
    @Override
    public boolean accepts(Class<?> expectedType, Object value, StatementContext ctx)
    {
        return value instanceof UUID;
    }

    @Override
    public Argument build(Class<?> expectedType, UUID value, StatementContext ctx)
    {
        return new UUIDArgument(value);
    }
}
