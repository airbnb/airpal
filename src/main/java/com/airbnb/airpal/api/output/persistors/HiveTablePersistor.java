package com.airbnb.airpal.api.output.persistors;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.output.builders.JobOutputBuilder;
import com.airbnb.airpal.core.execution.QueryExecutionAuthorizer;

import java.net.URI;

public class HiveTablePersistor
        implements Persistor
{
    @Override
    public boolean canPersist(QueryExecutionAuthorizer authorizer)
    {
        return false;
    }

    @Override
    public URI persist(JobOutputBuilder outputBuilder, Job job)
    {
        return null;
    }
}
