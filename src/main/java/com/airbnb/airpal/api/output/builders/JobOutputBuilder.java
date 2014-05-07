package com.airbnb.airpal.api.output.builders;

import com.facebook.presto.client.Column;

import java.io.File;
import java.util.List;

/**
 * Author: @andykram
 */
public interface JobOutputBuilder
{
    public void addRow(List<Object> row);

    public void addColumns(List<Column> columns);

    public Iterable<File> build();
}
