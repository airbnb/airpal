package com.airbnb.airpal.sql.jdbi;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.Argument;

import java.net.URI;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class URIArgument implements Argument
{
    private final URI uri;

    public URIArgument(URI uri)
    {
        this.uri = uri;
    }

    @Override
    public void apply(int position, PreparedStatement statement, StatementContext ctx)
            throws SQLException
    {
        statement.setString(position, uri.toString());
    }
}
