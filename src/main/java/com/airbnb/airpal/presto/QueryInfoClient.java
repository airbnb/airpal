package com.airbnb.airpal.presto;

import com.facebook.presto.execution.Input;
import com.facebook.presto.execution.QueryStats;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;
import com.google.common.net.MediaType;
import io.airlift.http.client.FullJsonResponseHandler;
import io.airlift.http.client.HttpClient;
import io.airlift.http.client.HttpStatus;
import io.airlift.http.client.Request;
import io.airlift.json.JsonCodec;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.util.Set;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.net.HttpHeaders.ACCEPT;
import static com.google.common.net.HttpHeaders.USER_AGENT;
import static io.airlift.http.client.FullJsonResponseHandler.createFullJsonResponseHandler;
import static io.airlift.http.client.Request.Builder.prepareGet;

@Slf4j
public class QueryInfoClient
{
    private static final String USER_AGENT_VALUE = QueryInfoClient.class.getSimpleName() +
            "/" +
            MoreObjects.firstNonNull(QueryInfoClient.class.getPackage().getImplementationVersion(), "unknown");

    private final HttpClient httpClient;
    private final FullJsonResponseHandler<BasicQueryInfo> queryInfoHandler;

    public QueryInfoClient(HttpClient httpClient, JsonCodec<BasicQueryInfo> queryInfoCodec)
    {
        this.httpClient = httpClient;
        this.queryInfoHandler = createFullJsonResponseHandler(queryInfoCodec);
    }

    public BasicQueryInfo from(URI infoUri)
    {
        infoUri = checkNotNull(infoUri, "infoUri is null");

        Request request = prepareGet()
                .setHeader(USER_AGENT, USER_AGENT_VALUE)
                .setHeader(ACCEPT, MediaType.JSON_UTF_8.toString())
                .setUri(infoUri)
                .build();

        Exception cause = null;
        long start = System.nanoTime();
        long attempts = 0;

        FullJsonResponseHandler.JsonResponse<BasicQueryInfo> response;
        try {
            response = httpClient.execute(request, queryInfoHandler);
            if (response.getStatusCode() == HttpStatus.OK.code() && response.hasValue()) {
                return response.getValue();
            }
        }
        catch (RuntimeException e) {
            log.error("Caught error in QueryInfoClient load", e);
        }

        return null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BasicQueryInfo
    {
        private final QueryStats queryStats;
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
