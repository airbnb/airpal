package com.airbnb.airpal.core;

import com.airbnb.airpal.core.execution.ExecutionAuthorizer;
import com.facebook.presto.client.Column;

import java.util.List;

public interface Persistor
{
    public void onColumns(List<Column> columns);

    public void onData(Iterable<List<Object>> data);

    public void persist();

    public boolean canPersist(ExecutionAuthorizer authorizer);
}
