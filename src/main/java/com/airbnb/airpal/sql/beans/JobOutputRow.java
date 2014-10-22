package com.airbnb.airpal.sql.beans;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobOutputRow
{
    private long id;
    private String type;
    private String description;
    private String location;
    private int jobId;
}
