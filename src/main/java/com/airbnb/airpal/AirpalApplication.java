package com.airbnb.airpal;

import com.airbnb.airpal.core.health.PrestoHealthCheck;
import com.airbnb.airpal.modules.AirpalModule;
import com.airbnb.airpal.modules.DropwizardModule;
import com.airbnb.airpal.resources.ExecuteResource;
import com.airbnb.airpal.resources.HealthResource;
import com.airbnb.airpal.resources.PingResource;
import com.airbnb.airpal.resources.QueryResource;
import com.airbnb.airpal.resources.SessionResource;
import com.airbnb.airpal.resources.TablesResource;
import com.airbnb.airpal.resources.sse.SSEEventSourceServlet;
import com.google.common.collect.ImmutableList;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Stage;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.flyway.FlywayBundle;
import io.dropwizard.flyway.FlywayFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;
import org.apache.shiro.web.env.EnvironmentLoaderListener;
import org.apache.shiro.web.servlet.ShiroFilter;

import javax.servlet.DispatcherType;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletRegistration;

import java.util.EnumSet;
import java.util.List;

import static com.sun.jersey.core.util.ReaderWriter.BUFFER_SIZE_SYSTEM_PROPERTY;

public class AirpalApplication extends Application<AirpalConfiguration>
{
    @Override
    public void initialize(Bootstrap<AirpalConfiguration> bootstrap) {
        final AssetsBundle assetBundle = new AssetsBundle("/assets", "/app", "index.html");
        final ViewBundle viewBundle = new ViewBundle();
        final FlywayBundle<AirpalConfiguration> flywayBundle = new FlywayBundle<AirpalConfiguration>() {
            @Override
            public DataSourceFactory getDataSourceFactory(AirpalConfiguration airpalConfiguration)
            {
                return airpalConfiguration.getDataSourceFactory();
            }

            @Override
            public FlywayFactory getFlywayFactory(AirpalConfiguration configuration)
            {
                return super.getFlywayFactory(configuration);
            }
        };

        bootstrap.addBundle(assetBundle);
        bootstrap.addBundle(viewBundle);
        bootstrap.addBundle(flywayBundle);
    }

    @Override
    public void run(AirpalConfiguration config,
                    Environment environment) throws Exception
    {
        System.setProperty(BUFFER_SIZE_SYSTEM_PROPERTY, String.valueOf(config.getBufferSize().toBytes()));
        Injector injector = Guice.createInjector(Stage.PRODUCTION,
                                                 new DropwizardModule(config, environment),
                                                 new AirpalModule(config, environment));

        environment.healthChecks().register("presto", injector.getInstance(PrestoHealthCheck.class));

        environment.jersey().register(injector.getInstance(ExecuteResource.class));
        environment.jersey().register(injector.getInstance(QueryResource.class));
        environment.jersey().register(injector.getInstance(TablesResource.class));
        environment.jersey().register(injector.getInstance(HealthResource.class));
        environment.jersey().register(injector.getInstance(PingResource.class));
        environment.jersey().register(injector.getInstance(SessionResource.class));

        // Setup Authentication
        registerShiro(config, environment, injector.getInstance(EnvironmentLoaderListener.class));

        // Setup SSE (Server Sent Events)
        ServletRegistration.Dynamic sseServlet = environment.servlets()
                .addServlet("updates", injector.getInstance(SSEEventSourceServlet.class));
        sseServlet.setAsyncSupported(true);
        sseServlet.addMapping("/api/updates/subscribe");
    }

    private void registerShiro(AirpalConfiguration configuration, Environment environment, ServletContextListener listener)
    {
        environment
                .servlets()
                .addServletListeners(listener);
        List<String> securedUrlsList = configuration.getShiroConfiguration().getSecuredUrls();
        List<String> dispatchTypesList = configuration.getShiroConfiguration().getDispatchTypes();
        ImmutableList.Builder<DispatcherType> dispatcherTypeBuilder = ImmutableList.builder();
        String[] securedUrls = securedUrlsList.toArray(new String[securedUrlsList.size()]);

        for (String dispatchType : dispatchTypesList) {
            dispatcherTypeBuilder.add(DispatcherType.valueOf(dispatchType.toUpperCase()));
        }

        environment.servlets()
                .addFilter("shiro", ShiroFilter.class)
                .addMappingForUrlPatterns(EnumSet.copyOf(dispatcherTypeBuilder.build()),
                        false,
                        securedUrls);
    }

    public static void main(final String[] args) throws Exception {
        final AirpalApplication application = new AirpalApplication();
        application.run(args);
    }
}
