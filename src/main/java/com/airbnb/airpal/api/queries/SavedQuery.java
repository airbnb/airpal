package com.airbnb.airpal.api.queries;

import java.util.UUID;

public interface SavedQuery
{
    String getUser();

    String getName();

    String getDescription();

    UUID getUuid();

    FeaturedQuery.QueryWithPlaceholders getQueryWithPlaceholders();
}
