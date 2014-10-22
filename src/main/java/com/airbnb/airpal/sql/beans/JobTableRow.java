package com.airbnb.airpal.sql.beans;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobTableRow
{
    private long id;
    private long jobId;
    private long tableId;
}
