package com.airbnb.airpal.presto;

import com.airbnb.airlift.http.client.OldJettyHttpClient;
import com.facebook.presto.execution.Input;
import com.facebook.presto.execution.QueryStats;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.net.MediaType;
import io.airlift.http.client.AsyncHttpClient;
import io.airlift.http.client.FullJsonResponseHandler;
import io.airlift.http.client.HttpClientConfig;
import io.airlift.http.client.HttpStatus;
import io.airlift.http.client.Request;
import io.airlift.json.JsonCodec;
import io.airlift.units.Duration;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.net.HttpHeaders.ACCEPT;
import static com.google.common.net.HttpHeaders.USER_AGENT;
import static io.airlift.http.client.FullJsonResponseHandler.createFullJsonResponseHandler;
import static io.airlift.http.client.Request.Builder.prepareGet;
import static io.airlift.json.JsonCodec.jsonCodec;

@Slf4j
public class QueryInfoClient
{
    private static final String USER_AGENT_VALUE = QueryInfoClient.class.getSimpleName() +
            "/" +
            Objects.firstNonNull(QueryInfoClient.class.getPackage().getImplementationVersion(), "unknown");

    private final AsyncHttpClient httpClient;
    private final FullJsonResponseHandler<BasicQueryInfo> queryInfoHandler;

    public QueryInfoClient(AsyncHttpClient httpClient, JsonCodec<BasicQueryInfo> queryInfoCodec)
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

    public static QueryInfoClient create()
    {
        AsyncHttpClient httpClient = new OldJettyHttpClient(
                new HttpClientConfig().setConnectTimeout(new Duration(10, TimeUnit.SECONDS)));

        return new QueryInfoClient(httpClient, jsonCodec(BasicQueryInfo.class));
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
