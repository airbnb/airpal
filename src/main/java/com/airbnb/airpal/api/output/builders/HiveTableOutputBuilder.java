package com.airbnb.airpal.api.output.builders;

import com.facebook.presto.client.Column;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.util.List;

import static java.lang.String.format;

@RequiredArgsConstructor
public class HiveTableOutputBuilder
        implements JobOutputBuilder
{
    private final String destinationSchema;
    private final String tmpTableName;

    @Override
    public void addRow(List<Object> row)
            throws FileTooLargeException
    {}

    @Override
    public void addColumns(List<Column> columns)
            throws FileTooLargeException
    {}

    @Override
    public String processQuery(String query)
    {
        String tableFqn = format("%s.%s", destinationSchema, tmpTableName);
        return format("CREATE TABLE %s AS %s", tableFqn, query);
    }

    @Override
    public File build()
    {
        return null;
    }

    @Override
    public void delete()
    {}
}
