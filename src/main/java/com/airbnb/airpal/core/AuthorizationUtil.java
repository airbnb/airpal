package com.airbnb.airpal.core;

import com.airbnb.airpal.presto.Table;
import com.google.common.base.Predicate;
import org.apache.shiro.subject.Subject;

import javax.annotation.Nullable;

import static java.lang.String.format;

public class AuthorizationUtil
{
    public static boolean isAuthorizedRead(Subject subject, Table table)
    {
        return isAuthorizedRead(subject, table.getConnectorId(), table.getSchema(), table.getTable());
    }

    public static boolean isAuthorizedRead(Subject subject, String connectorId, String schema, String table)
    {
        return subject.isPermitted(format("read:%s.%s:%s", connectorId, schema, table));
    }

    public static boolean isAuthorizedWrite(Subject subject, String connectorId, String schema, String table)
    {
        return subject.isPermitted(format("write:%s.%s:%s", connectorId, schema, table));
    }

    public static class AuthorizedTablesPredicate
            implements Predicate<Table>
    {
        private final Subject subject;

        public AuthorizedTablesPredicate(Subject subject)
        {
            this.subject = subject;
        }

        @Override
        public boolean apply(@Nullable Table input)
        {
            if (input == null) {
                return false;
            }

            return isAuthorizedRead(subject, input);
        }
    }
}
