package com.airbnb.airpal.api.output;

import com.airbnb.airpal.api.output.builders.FileTooLargeException;
import com.airbnb.airpal.core.execution.QueryExecutionAuthorizer;
import com.facebook.presto.client.Column;

import java.util.List;

public interface Persistor
{
    public void onColumns(List<Column> columns)
            throws FileTooLargeException;

    public void onData(Iterable<List<Object>> data)
            throws FileTooLargeException;

    public void persist();

    public boolean canPersist(QueryExecutionAuthorizer authorizer);
}
