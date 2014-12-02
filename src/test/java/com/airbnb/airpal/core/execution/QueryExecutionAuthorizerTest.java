package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.presto.Table;
import com.google.common.collect.ImmutableSet;
import org.junit.Test;

import java.util.Set;

import static com.airbnb.airpal.core.execution.QueryExecutionAuthorizer.tablesUsedByQuery;
import static org.junit.Assert.assertEquals;

public class QueryExecutionAuthorizerTest
{
    static String defaultConnector = "hive";
    static String defaultSchema = "default";

    static String TEST_CREATE_TABLE = "CREATE TABLE the_gibson.users_pii AS SELECT * FROM users;";
    @Test
    public void testTableReferencesCreateTable()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_CREATE_TABLE, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_CREATE_VIEW = "CREATE VIEW the_gibson.users_pii AS SELECT pii_col FROM users;";
    @Test
    public void testTableReferencesCreateView()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_CREATE_VIEW, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_REPLACE_VIEW = "CREATE OR REPLACE VIEW the_gibson.users AS SELECT pii_col FROM users;";
    @Test
    public void testTableReferencesReplaceView()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_REPLACE_VIEW, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_ALTER_TABLE = "ALTER TABLE default.users RENAME TO the_gibson.users_pii; SELECT pii_col FROM the_gibson.users_pii;";
    @Test
    public void testTableReferencesRenameTable()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_ALTER_TABLE, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, "default", "users"),
                new Table(defaultConnector, "the_gibson", "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_ALTER_TABLE2 = "USE SCHEMA the_gibson; ALTER TABLE default.users RENAME TO users_pii; SELECT pii_col FROM users_pii;";
    @Test
    public void testTableReferencesRenameTable2()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_ALTER_TABLE2, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, "default", "users"),
                new Table(defaultConnector, "the_gibson", "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_ALTER_TABLE3 = "USE CATALOG cassandra; USE SCHEMA the_gibson; ALTER TABLE hive.default.users RENAME TO users_pii; SELECT pii_col FROM users_pii;";
    @Test
    public void testTableReferencesRenameTable3()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_ALTER_TABLE3, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, "default", "users"),
                new Table("cassandra", "the_gibson", "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_ACCESS_PII_UNION_VIEW = "SELECT str_col FROM the_gibson.users UNION ALL SELECT pii_str_col FROM users;";
    @Test
    public void testTableReferencesSelectUnion()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_ACCESS_PII_UNION_VIEW, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_ACCESS_WITH = "WITH a AS (SELECT * FROM users) SELECT * FROM the_gibson.users UNION ALL SELECT * FROM a;";
    @Test
    public void testTableReferencesSelectWith()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_ACCESS_WITH, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_BASIC_SELECT_COUNT = "SELECT COUNT(*) FROM users;";
    @Test
    public void testTableReferencesSelectCount()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_BASIC_SELECT_COUNT, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_SELECT_ALL = "SELECT * FROM users;";
    @Test
    public void testTableReferencesSelectStar()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_SELECT_ALL, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_SELECT_SUBQUERY = "SELECT * FROM (SELECT pii_str_col FROM users) UNION ALL SELECT * FROM the_gibson.users;";
    @Test
    public void testTableReferencesSelectStarSubquery()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_SELECT_SUBQUERY, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, "the_gibson", "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_DROP_VIEW = "DROP VIEW my_view";
    @Test
    public void testTableReferencesDropView()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_DROP_VIEW, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "my_view")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_DROP_TABLE = "DROP TABLE my_table";
    @Test
    public void testTableReferencesDropTable()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_DROP_TABLE, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "my_table")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_SELECT_ALIAS = "SELECT pii FROM users u JOIN users_pii p ON u.id = p.id;";
    @Test
    public void testTableReferencesJoinAlias()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_SELECT_ALIAS, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(defaultConnector, defaultSchema, "users"),
                new Table(defaultConnector, defaultSchema, "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_SELECT_CONNECTOR = "SELECT pii FROM cassandra.pii.users u JOIN users_pii p ON u.id = p.id;";
    @Test
    public void testTableReferencesSelectConnector()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_SELECT_CONNECTOR, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table("cassandra", "pii", "users"),
                new Table(defaultConnector, defaultSchema, "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    static String TEST_CROSS_JOIN_SUBSELECT = "SELECT * " +
            "FROM cassandra.pii.users u " +
            "CROSS JOIN (SELECT * FROM hive.pii.users) u2 " +
            "WHERE NOT u2.id IS NULL;";
    @Test
    public void testTableReferencesCrossJoinSubselect()
            throws Exception
    {
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_CROSS_JOIN_SUBSELECT, defaultConnector, defaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table("cassandra", "pii", "users"),
                new Table("hive", "pii", "users")
        );

        assertEquals(tablesExpected, tablesUsed);
    }

    @Test
    public void testAlternateDefaultConnectorSchemaReferences()
            throws Exception
    {
        String alternateDefaultConnector = "cassandra";
        String alternateDefaultSchema = "default2";
        Set<Table> tablesUsed = tablesUsedByQuery(TEST_SELECT_ALIAS, alternateDefaultConnector, alternateDefaultSchema);
        Set<Table> tablesExpected = ImmutableSet.of(
                new Table(alternateDefaultConnector, alternateDefaultSchema, "users"),
                new Table(alternateDefaultConnector, alternateDefaultSchema, "users_pii")
        );

        assertEquals(tablesExpected, tablesUsed);
    }
}