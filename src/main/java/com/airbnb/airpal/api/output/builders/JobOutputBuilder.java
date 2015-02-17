package com.airbnb.airpal.api.output.builders;

import com.facebook.presto.client.Column;

import java.io.File;
import java.util.List;

public interface JobOutputBuilder
{
    public void addRow(List<Object> row)
            throws FileTooLargeException;

    public void addColumns(List<Column> columns)
            throws FileTooLargeException;

    public String processQuery(String query);

    public File build();

    public void delete();
}
