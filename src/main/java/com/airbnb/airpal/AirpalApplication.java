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
import org.secnod.dropwizard.shiro.ShiroBundle;
import org.secnod.dropwizard.shiro.ShiroConfiguration;

import javax.servlet.ServletRegistration;

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
        final ShiroBundle<AirpalConfiguration> shiroBundle = new ShiroBundle<AirpalConfiguration>() {
            @Override
            protected ShiroConfiguration narrow(AirpalConfiguration configuration)
            {
                return configuration.getShiro();
            }
        };

        bootstrap.addBundle(assetBundle);
        bootstrap.addBundle(viewBundle);
        bootstrap.addBundle(flywayBundle);
        bootstrap.addBundle(shiroBundle);
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

    public static void main(final String[] args) throws Exception {
        final AirpalApplication application = new AirpalApplication();
        application.run(args);
    }
}
