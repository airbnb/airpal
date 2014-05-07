package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.presto.Table;
import com.google.common.collect.Iterables;
import org.apache.shiro.subject.Subject;

import java.util.HashSet;
import java.util.Set;

import static com.airbnb.airpal.core.AuthorizationUtil.AuthorizedTablesPredicate;
import static com.google.common.base.Preconditions.checkNotNull;

public class ExecutionAuthorizer
{
    private final Subject subject;
    private final Set<Table> seen = new HashSet<>();
    private boolean lastResult = false;

    public ExecutionAuthorizer(Subject subject)
    {
        this.subject = checkNotNull(subject);
    }

    public boolean isAuthorizedWrite(String connectorId, String schema, String table)
    {
        return AuthorizationUtil.isAuthorizedWrite(subject, connectorId, schema, table);
    }

    public boolean isAuthorizedRead(Set<Table> tables)
    {
        if (seen.containsAll(tables)) {
            return lastResult;
        }

        seen.addAll(tables);
        return (lastResult = Iterables.all(tables, new AuthorizedTablesPredicate(subject)));
    }
}
