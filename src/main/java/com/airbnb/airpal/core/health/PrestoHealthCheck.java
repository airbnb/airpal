package com.airbnb.airpal.core.health;

import com.codahale.metrics.health.HealthCheck;
import com.facebook.presto.client.StatementClient;
import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.inject.Inject;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.airbnb.airpal.presto.QueryRunner.QueryRunnerFactory;

public class PrestoHealthCheck extends HealthCheck
{
    private static final String HEALTH_CHECK_QUERY = "SELECT 1";

    private final Supplier<Result> resultSupplier;

    @Inject
    public PrestoHealthCheck(final QueryRunnerFactory queryRunnerFactory)
    {
        Supplier<Result> baseSupplier = new Supplier<Result>()
        {
            @Override
            public Result get()
            {
                final List<Object> invalidValue = ImmutableList.of((Object) new Integer(-1));
                List<Object> result;

                try (StatementClient client = queryRunnerFactory.create().startInternalQuery(HEALTH_CHECK_QUERY)) {
                    while (client.isValid() && !Thread.currentThread().isInterrupted()) {
                        Iterable<List<Object>> results = client.current().getData();
                        if (results != null) {
                            result = Iterables.getFirst(results, invalidValue);
                            assert(result != null);
                            assert(result.size() == 1);
                            assert(result.get(0) == 1);
                        }
                        client.advance();
                    }
                    return Result.healthy();
                } catch (Exception e) {
                    throw Throwables.propagate(e);
                }
            }
        };

        this.resultSupplier = Suppliers.memoizeWithExpiration(baseSupplier, 120, TimeUnit.SECONDS);
    }

    @Override
    protected Result check() throws Exception
    {
        return resultSupplier.get();
    }
}
