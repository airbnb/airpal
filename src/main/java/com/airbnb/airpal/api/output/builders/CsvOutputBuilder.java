package com.airbnb.airpal.api.output.builders;

import com.opencsv.CSVWriter;
import com.facebook.presto.client.Column;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.Lists;
import com.google.common.io.CountingOutputStream;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.List;
import java.util.UUID;

@Slf4j
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
    private final CountingOutputStream countingOutputStream;
    @JsonIgnore
    private final long maxFileSizeBytes;
    @JsonIgnore
    private boolean headerWritten = false;
    @JsonIgnore
    private final UUID jobUUID;

    public CsvOutputBuilder(boolean includeHeader, UUID jobUUID, long maxFileSizeBytes) throws IOException {
        this.includeHeader = includeHeader;
        this.jobUUID = jobUUID;
        this.outputFile = File.createTempFile(jobUUID.toString(), FILE_SUFFIX);
        this.maxFileSizeBytes = maxFileSizeBytes;
        this.countingOutputStream = new CountingOutputStream(new FileOutputStream(this.outputFile));
        this.csvWriter = new CSVWriter(new OutputStreamWriter(this.countingOutputStream));
    }

    @Override
    public void addRow(List<Object> row)
            throws FileTooLargeException
    {
        final String[] values = new String[row.size()];
        for (int i = 0; i < values.length; i++) {
            final Object value = row.get(i);
            values[i] = (value == null) ? "" : value.toString();
        }

        writeCsvRow(values);
    }

    @Override
    public void addColumns(List<Column> columns)
            throws FileTooLargeException
    {
        if (!headerWritten && includeHeader) {
            List<String> columnNames = Lists.transform(columns, Column.nameGetter());
            writeCsvRow(columnNames.toArray(new String[columnNames.size()]));
            headerWritten = true;
        }
    }

    @Override
    public String processQuery(String query)
    {
        return query;
    }

    private void writeCsvRow(String[] cols)
            throws FileTooLargeException
    {
        csvWriter.writeNext(cols);

        if (countingOutputStream.getCount() > maxFileSizeBytes) {
            try {
                csvWriter.close();
            }
            catch (IOException e) {
                log.error("Caught exception closing csv writer", e);
            }

            delete();
            throw new FileTooLargeException();
        }
    }

    @Override
    public File build()
    {
        try {
            csvWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return outputFile;
    }

    @Override
    public void delete()
    {
        log.info("Deleting outputFile {}", outputFile);
        if (!outputFile.delete()) {
            log.error("Failed to delete outputFile {}", outputFile);
        }
    }
}
