package com.airbnb.airpal.sql.jdbi;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.Argument;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

public class UUIDArgument
        implements Argument
{
    private final UUID uuid;

    public UUIDArgument(UUID uuid)
    {
        this.uuid = uuid;
    }

    @Override
    public void apply(int position, PreparedStatement statement, StatementContext ctx)
            throws SQLException
    {
        statement.setString(position, uuid.toString());
    }
}
