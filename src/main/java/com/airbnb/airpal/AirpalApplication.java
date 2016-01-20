package com.airbnb.airpal;

import com.airbnb.airpal.AirpalApplicationBase;
import com.airbnb.airpal.modules.AirpalModule;
import com.airbnb.airpal.modules.DropwizardModule;
import com.google.common.collect.ImmutableList;
import com.google.inject.AbstractModule;
import io.dropwizard.ConfiguredBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;
import org.secnod.dropwizard.shiro.ShiroBundle;
import org.secnod.dropwizard.shiro.ShiroConfiguration;

import java.util.Arrays;

public class AirpalApplication extends AirpalApplicationBase<AirpalConfiguration>
{
    @Override
    public Iterable<AbstractModule> getModules(AirpalConfiguration config, Environment environment)
    {
        return Arrays.asList(new DropwizardModule(config, environment),
                             new AirpalModule(config, environment));
    }

    @Override
    public Iterable<ConfiguredBundle<AirpalConfiguration>> getConfiguredBundles()
    {
        Iterable<ConfiguredBundle<AirpalConfiguration>> bundles = super.getConfiguredBundles();
        ImmutableList.Builder<ConfiguredBundle<AirpalConfiguration>> builder = ImmutableList.builder();

        for (ConfiguredBundle<AirpalConfiguration> bundle : bundles) {
            builder.add(bundle);
        }
        builder.add(new ShiroBundle<AirpalConfiguration>() {
            @Override
            protected ShiroConfiguration narrow(AirpalConfiguration configuration)
            {
                return configuration.getShiro();
            }
        });
        return builder.build();
    }

    public static void main(final String[] args) throws Exception {
        final AirpalApplication application = new AirpalApplication();
        application.run(args);
    }
}
