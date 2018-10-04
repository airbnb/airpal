package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.presto.QueryRunner;
import com.facebook.presto.client.QueryResults;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Function;
import com.google.common.base.Stopwatch;
import io.dropwizard.util.Duration;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@AllArgsConstructor
public class QueryClient
{
    private final QueryRunner queryRunner;
    private final Duration timeout;
    private final String query;
    private final AtomicReference<QueryResults> finalResults = new AtomicReference<>();

    public QueryClient(QueryRunner queryRunner, String query)
    {
        this(queryRunner, Duration.seconds(60 * 30), query);
    }

    public QueryClient(QueryRunner queryRunner, org.joda.time.Duration timeout, String query)
    {
        this(queryRunner, Duration.milliseconds(timeout.getMillis()), query);
    }

    public <T> T executeWith(Function<StatementClient, T> function)
            throws QueryTimeOutException
    {
        final Stopwatch stopwatch = Stopwatch.createStarted();
        T t = null;

        try (StatementClient client = queryRunner.startInternalQuery(query)) {
            while (client.isRunning() && !Thread.currentThread().isInterrupted()) {
                if (stopwatch.elapsed(TimeUnit.MILLISECONDS) > timeout.toMilliseconds()) {
                    throw new QueryTimeOutException(stopwatch.elapsed(TimeUnit.MILLISECONDS));
                }

                t = function.apply(client);
                client.advance();
            }

            finalResults.set(((QueryResults) client.finalStatusInfo()));
        } catch (RuntimeException | QueryTimeOutException e) {
            stopwatch.stop();
            throw e;
        }

        return t;
    }

    public QueryResults finalResults()
    {
        return finalResults.get();
    }

    @AllArgsConstructor
    public static class QueryTimeOutException extends Throwable
    {
        @Getter
        private final long elapsedMs;
    }
}
