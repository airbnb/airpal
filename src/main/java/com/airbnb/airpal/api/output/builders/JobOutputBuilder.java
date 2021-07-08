package com.airbnb.airpal.api.output.builders;

import com.facebook.presto.client.Column;

import java.io.File;
import java.util.List;

public interface JobOutputBuilder
{
    void addRow(List<Object> row)
            throws FileTooLargeException;

    void addColumns(List<Column> columns)
            throws FileTooLargeException;

    String processQuery(String query);

    File build();

    void delete();
}
