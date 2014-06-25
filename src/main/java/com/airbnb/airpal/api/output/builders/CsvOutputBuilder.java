package com.airbnb.airpal.api.output.builders;

import au.com.bytecode.opencsv.CSVWriter;
import com.facebook.presto.client.Column;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

public class CsvOutputBuilder implements JobOutputBuilder
{
    private static final String FILE_SUFFIX = ".csv";

    @JsonIgnore
    private final File outputFile;
    @JsonIgnore
    private final CSVWriter csvWriter;
    @JsonIgnore
    private final boolean includeHeader;
    @JsonIgnore
    private boolean headerWritten = false;
    @JsonIgnore
    private final UUID jobUUID;

    public CsvOutputBuilder(boolean includeHeader, UUID jobUUID) throws IOException {
        this.includeHeader = includeHeader;
        this.jobUUID = jobUUID;
        this.outputFile = File.createTempFile(jobUUID.toString(), FILE_SUFFIX);
        this.csvWriter = new CSVWriter(new FileWriter(outputFile));
    }

    @Override
    public void addRow(List<Object> row)
    {
        final String[] values = new String[row.size()];
        for (int i = 0; i < values.length; i++) {
            final Object value = row.get(i);
            values[i] = (value == null) ? "" : value.toString();
        }

        csvWriter.writeNext(values);
    }

    @Override
    public void addColumns(List<Column> columns)
    {
        if (!headerWritten && includeHeader) {
            List<String> columnNames = Lists.transform(columns, Column.nameGetter());
            csvWriter.writeNext(columnNames.toArray(new String[columnNames.size()]));
            headerWritten = true;
        }
    }

    @Override
    public Iterable<File> build()
    {
        try {
            csvWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (outputFile != null) {
            return ImmutableList.of(outputFile);
        } else {
            return null;
        }
    }

    @Override
    public void delete()
    {
        outputFile.delete();
    }
}
