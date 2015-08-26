package com.airbnb.airpal.api.queries;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;
import lombok.*;
import org.joda.time.DateTime;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class FeaturedQuery extends UserSavedQuery
{
    @NotNull
    @JsonProperty
    private boolean featured = true;

    public FeaturedQuery(QueryWithPlaceholders queryWithPlaceholders,
                         String user,
                         String name,
                         String description,
                         DateTime createdAt,
                         UUID uuid,
                         boolean featured)
    {
        super(queryWithPlaceholders, user, name, description, createdAt, uuid, featured);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Position
    {
        @JsonProperty
        private int row;
        @JsonProperty
        private int column;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueryPlaceholder
    {
        @JsonProperty
        private int length;
        @JsonProperty
        private Position position;
        @JsonProperty
        private String name;
        @JsonProperty
        private String typeRestriction;
    }

    public static Pattern PLACEHOLDER_PATTERN = Pattern.compile("(\\[\\[placeholder:([\\w-]+)\\]\\])",
                                                                Pattern.CASE_INSENSITIVE);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueryWithPlaceholders
    {
        @JsonProperty
        private String query;
        @JsonProperty
        private List<QueryPlaceholder> placeholders;

        public static QueryWithPlaceholders fromQuery(String query)
        {
            ImmutableList.Builder<QueryPlaceholder> builder = ImmutableList.builder();
            Matcher matcher = PLACEHOLDER_PATTERN.matcher(query);
            String[] queryLines = query.split("\\r?\\n");

            while (matcher.find()) {
                int start = matcher.start();
                int end = matcher.end();
                int line = 0;

                for (int i = 0; i < queryLines.length; i++) {
                    if (queryLines[i].contains(matcher.group(1))) {
                        line = i;
                        break;
                    }
                }

                builder.add(new QueryPlaceholder((end - start),
                                                 new Position(line, start),
                                                 matcher.group(2),
                                                 null));
            }

            return new QueryWithPlaceholders(query, builder.build());
        }
    }
}
