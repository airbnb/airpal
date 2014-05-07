package com.airbnb.airpal.api.queries;

import java.util.UUID;

/**
 * Author: @andykram
 */
public interface SavedQuery
{
    public String getUser();

    public String getName();

    public String getDescription();

    public UUID getUuid();

    public FeaturedQuery.QueryWithPlaceholders getQueryWithPlaceholders();
}
