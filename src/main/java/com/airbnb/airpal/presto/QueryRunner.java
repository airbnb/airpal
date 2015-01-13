package com.airbnb.airpal.presto;

import com.facebook.presto.client.ClientSession;
import com.facebook.presto.client.QueryResults;
import com.facebook.presto.client.StatementClient;
import io.airlift.http.client.AsyncHttpClient;
import io.airlift.json.JsonCodec;

import java.io.Closeable;

import static com.google.common.base.Preconditions.checkNotNull;
import static io.airlift.json.JsonCodec.jsonCodec;

public class QueryRunner
        implements Closeable
{
    private final JsonCodec<QueryResults> queryResultsCodec;
    private final ClientSession session;
    private final AsyncHttpClient httpClient;

    protected QueryRunner(ClientSession session, JsonCodec<QueryResults> queryResultsCodec, AsyncHttpClient httpClient)
    {
        this.session = checkNotNull(session, "session is null");
        this.queryResultsCodec = checkNotNull(queryResultsCodec, "queryResultsCodec is null");
        this.httpClient = httpClient;
    }

    public StatementClient startInternalQuery(String query)
    {
        return new StatementClient(httpClient, queryResultsCodec, session, query);
    }

    @Override
    public void close()
    {
        httpClient.close();
    }

    public static class QueryRunnerFactory
    {
        private final ClientSessionFactory sessionFactory;
        private final AsyncHttpClient httpClient;

        public QueryRunnerFactory(ClientSessionFactory sessionFactory, AsyncHttpClient httpClient)
        {
            this.httpClient = httpClient;
            this.sessionFactory = sessionFactory;
        }

        public QueryRunner create(String user, String schema)
        {
            return new QueryRunner(sessionFactory.create(user, schema), jsonCodec(QueryResults.class), httpClient);
        }

        public QueryRunner create()
        {
            return new QueryRunner(sessionFactory.create(), jsonCodec(QueryResults.class), httpClient);
        }
    }
}
