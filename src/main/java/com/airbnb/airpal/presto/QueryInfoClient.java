package com.airbnb.airpal.presto;

import com.facebook.presto.execution.Input;
import com.facebook.presto.execution.QueryStats;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationConfig;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.guava.GuavaModule;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import com.google.common.base.MoreObjects;
import com.google.common.net.MediaType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;
import java.net.URI;
import java.util.Set;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.net.HttpHeaders.ACCEPT;
import static com.google.common.net.HttpHeaders.USER_AGENT;

@Slf4j
public class QueryInfoClient
{
    private static final String USER_AGENT_VALUE = QueryInfoClient.class.getSimpleName() +
            "/" +
            MoreObjects.firstNonNull(QueryInfoClient.class.getPackage().getImplementationVersion(), "unknown");

    private final OkHttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new GuavaModule())
            .registerModule(new JodaModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public QueryInfoClient(OkHttpClient httpClient)
    {
        this.httpClient = httpClient;
    }

    public BasicQueryInfo from(URI infoUri)
    {
        infoUri = checkNotNull(infoUri, "infoUri is null");

        log.info("Calling URL {}", infoUri.toString());

        Request request = new Request.Builder()
                .url(infoUri.toString())
                .header(USER_AGENT, USER_AGENT_VALUE)
                .header(ACCEPT, MediaType.JSON_UTF_8.toString())
                .build();

        Exception cause = null;
        long start = System.nanoTime();
        long attempts = 0;

        Response response;
        try {
            response = httpClient.newCall(request).execute();
            if (response.isSuccessful()) {
                return mapper.readValue(response.body().string(), BasicQueryInfo.class);
            }
        }
        catch (RuntimeException|IOException e) {
            log.error("Caught error in QueryInfoClient load", e);
        }

        return null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BasicQueryInfo
    {
        @JsonProperty
        private final QueryStats queryStats;
        @JsonProperty
        private final Set<Input> inputs;

        @JsonCreator
        public BasicQueryInfo(
                @JsonProperty("queryStats") QueryStats queryStats,
                @JsonProperty("inputs") Set<Input> inputs)
        {
            this.queryStats = queryStats;
            this.inputs = inputs;
        }
    }
}
