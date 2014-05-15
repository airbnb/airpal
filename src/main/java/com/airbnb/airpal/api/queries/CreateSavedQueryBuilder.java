package com.airbnb.airpal.api.queries;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import org.joda.time.DateTime;

import java.util.UUID;

import static com.google.common.base.Preconditions.*;

public class CreateSavedQueryBuilder
{
    @JsonProperty
    @Getter
    private String description;
    @JsonProperty
    @Getter
    private String query;
    @JsonProperty
    @Getter
    private String user;
    @JsonProperty
    @Getter
    private String name;
    @Getter
    private final DateTime createdAt = new DateTime();
    @Getter
    private final boolean featured;

    private CreateSavedQueryBuilder(String user,
                                    String query,
                                    String name,
                                    String description,
                                    boolean featured)
    {
        this.user = user;
        this.query = query;
        this.name = name;
        this.description = description;
        this.featured = featured;
    }

    public static CreateSavedQueryBuilder featured()
    {
        return new CreateSavedQueryBuilder(null, null, null, null, true);
    }

    public static CreateSavedQueryBuilder notFeatured()
    {
        return new CreateSavedQueryBuilder(null, null, null, null, false);
    }

    public CreateSavedQueryBuilder user(String user)
    {
        this.user = checkNotNull(user, "User can not be null");
        return this;
    }

    public CreateSavedQueryBuilder query(String query)
    {
        this.query = checkNotNull(query, "Query can not be null");
        return this;
    }

    public CreateSavedQueryBuilder name(String name)
    {
        this.name = checkNotNull(name, "Name can not be null");
        return this;
    }

    public CreateSavedQueryBuilder description(String description)
    {
        this.description = checkNotNull(description, "Description can not be null");
        return this;
    }

    public SavedQuery build()
    {
        checkNotNull(user, "User can not be null");
        checkNotNull(query, "Query can not be null");
        checkNotNull(name, "Name can not be null");
        checkNotNull(description, "Description can not be null");

        final FeaturedQuery.QueryWithPlaceholders queryWithPlaceholders =
                checkNotNull(FeaturedQuery.QueryWithPlaceholders.fromQuery(getQuery()),
                             "Generated query can not be null");

        if (isFeatured()) {
            return new FeaturedQuery(queryWithPlaceholders,
                                     getUser(),
                                     getName(),
                                     getDescription(),
                                     getCreatedAt(),
                                     UUID.randomUUID(),
                                     true);
        } else {
            return new UserSavedQuery(queryWithPlaceholders,
                                      getUser(),
                                      getName(),
                                      getDescription(),
                                      getCreatedAt(),
                                      UUID.randomUUID(),
                                      false);
        }
    }
}
