package com.airbnb.airpal;

import com.airbnb.airpal.core.AirpalUserFactory;
import com.airbnb.airpal.core.health.PrestoHealthCheck;
import com.airbnb.airpal.modules.AirpalModule;
import com.airbnb.airpal.modules.DropwizardModule;
import com.airbnb.airpal.resources.ExecuteResource;
import com.airbnb.airpal.resources.FilesResource;
import com.airbnb.airpal.resources.HealthResource;
import com.airbnb.airpal.resources.PingResource;
import com.airbnb.airpal.resources.QueriesResource;
import com.airbnb.airpal.resources.QueryResource;
import com.airbnb.airpal.resources.ResultsPreviewResource;
import com.airbnb.airpal.resources.S3FilesResource;
import com.airbnb.airpal.resources.SessionResource;
import com.airbnb.airpal.resources.TablesResource;
import com.airbnb.airpal.resources.UserResource;
import com.airbnb.airpal.resources.UsersResource;
import com.airbnb.airpal.resources.sse.SSEEventSourceServlet;
import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Stage;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.Bundle;
import io.dropwizard.ConfiguredBundle;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.flyway.FlywayBundle;
import io.dropwizard.flyway.FlywayFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import java.util.Arrays;
import java.util.Collections;

import javax.servlet.ServletRegistration;

import static com.sun.jersey.core.util.ReaderWriter.BUFFER_SIZE_SYSTEM_PROPERTY;

public abstract class AirpalApplicationBase<T extends AirpalConfiguration> extends Application<T>
{
    protected Injector injector;

    @Override
    public void initialize(Bootstrap<T> bootstrap)
    {
        for (ConfiguredBundle<T> configuredBundle : getConfiguredBundles()) {
            bootstrap.addBundle(configuredBundle);
        }
        for (Bundle bundle : getBundles()) {
            bootstrap.addBundle(bundle);
        }
    }

    public abstract Iterable<AbstractModule> getModules(T config, Environment environment);

    public Iterable<ConfiguredBundle<T>> getConfiguredBundles()
    {
        return Collections.emptyList();
    }

    public Iterable<Bundle> getBundles()
    {
        return Arrays.asList(
                new AssetsBundle("/assets", "/app", "index.html"),
                new ViewBundle(),
                new FlywayBundle<T>() {
                    @Override
                    public DataSourceFactory getDataSourceFactory(T configuration)
                    {
                        return configuration.getDataSourceFactory();
                    }

                    @Override
                    public FlywayFactory getFlywayFactory(T configuration)
                    {
                        return configuration.getFlywayFactory();
                    }
                });
    }

    @Override
    public void run(T config, Environment environment) throws Exception
    {
        this.injector = Guice.createInjector(Stage.PRODUCTION, getModules(config, environment));

        System.setProperty(BUFFER_SIZE_SYSTEM_PROPERTY, String.valueOf(config.getBufferSize().toBytes()));

        environment.healthChecks().register("presto", injector.getInstance(PrestoHealthCheck.class));

        environment.jersey().register(injector.getInstance(ExecuteResource.class));
        environment.jersey().register(injector.getInstance(QueryResource.class));
        environment.jersey().register(injector.getInstance(QueriesResource.class));
        environment.jersey().register(injector.getInstance(UserResource.class));
        environment.jersey().register(injector.getInstance(UsersResource.class));
        environment.jersey().register(injector.getInstance(TablesResource.class));
        environment.jersey().register(injector.getInstance(HealthResource.class));
        environment.jersey().register(injector.getInstance(PingResource.class));
        environment.jersey().register(injector.getInstance(SessionResource.class));
        environment.jersey().register(injector.getInstance(FilesResource.class));
        environment.jersey().register(injector.getInstance(ResultsPreviewResource.class));
        environment.jersey().register(injector.getInstance(S3FilesResource.class));

        environment.jersey().register(new UserInjectableProvider(injector.getInstance(AirpalUserFactory.class)));

        // Setup SSE (Server Sent Events)
        ServletRegistration.Dynamic sseServlet = environment.servlets()
                .addServlet("updates", injector.getInstance(SSEEventSourceServlet.class));
        sseServlet.setAsyncSupported(true);
        sseServlet.addMapping("/api/updates/subscribe");
    }
}
