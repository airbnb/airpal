package com.airbnb.airpal.api.queries;

import java.util.UUID;

public interface SavedQuery
{
    public String getUser();

    public String getName();

    public String getDescription();

    public UUID getUuid();

    public FeaturedQuery.QueryWithPlaceholders getQueryWithPlaceholders();
}
