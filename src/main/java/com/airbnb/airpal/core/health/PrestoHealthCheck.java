package com.airbnb.airpal.core.health;

import com.codahale.metrics.health.HealthCheck;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static com.airbnb.airpal.presto.QueryRunner.QueryRunnerFactory;

public class PrestoHealthCheck extends HealthCheck
{
    private static final String HEALTH_CHECK_QUERY = "SELECT 1";

    private final Supplier<Future<Result>> resultSupplier;

    @Inject
    public PrestoHealthCheck(
            final QueryRunnerFactory queryRunnerFactory,
            @Named("presto") final ExecutorService executorService)
    {
        // To prevent a lagging Presto health check from freezing Airpal, by blocking a large
        // number of health check threads, we have the supplier return a Future<Result>. This
        // way, the Future is immediately memoized and all calls will be successful if the
        // future resolved successfully.
        Supplier<Future<Result>> baseSupplier = new Supplier<Future<Result>>()
        {
            @Override
            public Future<Result> get()
            {
                return executorService.submit(new Callable<Result>() {
                    @Override
                    public Result call()
                            throws Exception
                    {
                        final List<Object> invalidValue = ImmutableList.of((Object) new Integer(-1));
                        List<Object> result;

                        try (StatementClient client = queryRunnerFactory.create().startInternalQuery(HEALTH_CHECK_QUERY)) {
                            while (client.isRunning() && !Thread.currentThread().isInterrupted()) {
                                Iterable<List<Object>> results = client.currentData().getData();
                                if (results != null) {
                                    result = Iterables.getFirst(results, invalidValue);
                                    assert(result != null);
                                    assert(result.size() == 1);
                                    assert((int)result.get(0) == 1);
                                }
                                client.advance();
                            }
                            return Result.healthy();
                        } catch (Exception e) {
                            throw Throwables.propagate(e);
                        }
                    }
                });
            }
        };

        this.resultSupplier = Suppliers.memoizeWithExpiration(baseSupplier, 120, TimeUnit.SECONDS);
    }

    @Override
    protected Result check() throws Exception
    {
        // Wait at most 5 seconds for the future to resolve, so that we don't block too many
        // threads awaiting the result of this check.
        return resultSupplier.get().get(5, TimeUnit.SECONDS);
    }
}
