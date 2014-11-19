package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.airbnb.airpal.presto.Table;
import com.facebook.presto.sql.parser.SqlParser;
import com.facebook.presto.sql.tree.Statement;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;

import java.util.List;
import java.util.Set;

import static com.airbnb.airpal.core.AuthorizationUtil.AuthorizedTablesPredicate;
import static com.airbnb.airpal.core.execution.InputReferenceExtractor.CatalogSchemaContext;
import static com.google.common.base.Preconditions.checkNotNull;

public class QueryExecutionAuthorizer
{
    private static final SqlParser SQL_PARSER = new SqlParser();

    private final AirpalUser user;
    private final String defaultConnector;
    private final String defaultSchema;

    public QueryExecutionAuthorizer(AirpalUser user, String defaultConnector, String defaultSchema)
    {
        this.user = checkNotNull(user);
        this.defaultConnector = checkNotNull(defaultConnector);
        this.defaultSchema = checkNotNull(defaultSchema);
    }

    public boolean isAuthorizedWrite(String connectorId, String schema, String table)
    {
        return AuthorizationUtil.isAuthorizedWrite(user, connectorId, schema, table);
    }

    public boolean isAuthorizedRead(Set<Table> tables)
    {
        return Iterables.all(tables, new AuthorizedTablesPredicate(user));
    }

    private static Splitter STATEMENT_SPLITTER = Splitter.on(";").omitEmptyStrings();

    public static Set<Table> tablesUsedByQuery(String query, String defaultConnector, String defaultSchema)
    {
        List<String> statements = STATEMENT_SPLITTER.splitToList(query);
        ImmutableSet.Builder<Table> tables = ImmutableSet.builder();
        CatalogSchemaContext context = new CatalogSchemaContext(defaultConnector, defaultSchema);

        for (String strStatement : statements) {
            InputReferenceExtractor extractor = new InputReferenceExtractor();
            Statement statement = SQL_PARSER.createStatement(strStatement);
            context = statement.accept(extractor, context);

            tables.addAll(extractor.getReferences());
        }

        return tables.build();
    }

    public Set<Table> tablesUsedByQuery(String query)
    {
        return tablesUsedByQuery(query, defaultConnector, defaultSchema);
    }
}
