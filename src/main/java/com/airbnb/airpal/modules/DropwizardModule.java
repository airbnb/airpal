package com.airbnb.airpal.modules;

import com.airbnb.airpal.AirpalConfiguration;
import com.airbnb.airpal.api.output.CSVPersistentOutput;
import com.airbnb.airpal.api.output.HiveTablePersistentOutput;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.health.HealthCheckRegistry;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.hubspot.rosetta.Rosetta;
import io.dropwizard.setup.Environment;


public class DropwizardModule extends AbstractModule {

    private final Environment environment;
    private final AirpalConfiguration configuration;

    public DropwizardModule(AirpalConfiguration configuration,
                            Environment environment)
    {
        this.configuration = configuration;
        this.environment = environment;
    }

    @Override
    protected void configure() {
        bind(MetricRegistry.class).toInstance(environment.metrics());
        bind(HealthCheckRegistry.class).toInstance(environment.healthChecks());
    }

    @Singleton
    @Provides
    protected ObjectMapper provideObjectMapper()
    {
        ObjectMapper mapper = environment.getObjectMapper();
        mapper.registerSubtypes(
                new NamedType(CSVPersistentOutput.class, "csv"),
                new NamedType(HiveTablePersistentOutput.class, "hive")
        );
        Rosetta.getMapper().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Rosetta.getMapper().enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES);

        return mapper;
    }
}
