package com.airbnb.airpal.presto;

import com.google.common.base.Joiner;

public class Util {
    private static Joiner FQN_JOINER = Joiner.on('.').skipNulls();

    public static String fqn(String databaseName, String tableName) {
        return FQN_JOINER.join(databaseName, tableName);
    }

    public static String fqn(String connectorId, String databaseName, String tableName) {
        return FQN_JOINER.join(connectorId, databaseName, tableName);
    }
}