package com.airbnb.airpal;

import com.airbnb.airpal.AirpalApplicationBase;
import com.airbnb.airpal.modules.AirpalModule;
import com.airbnb.airpal.modules.DropwizardModule;
import com.google.inject.AbstractModule;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;

import java.util.Arrays;

public class AirpalApplication extends AirpalApplicationBase<AirpalConfiguration>
{
    @Override
    public Iterable<AbstractModule> getModules(AirpalConfiguration config, Environment environment)
    {
        return Arrays.asList(new DropwizardModule(config, environment),
                             new AirpalModule(config, environment));
    }

    public static void main(final String[] args) throws Exception {
        final AirpalApplication application = new AirpalApplication();
        application.run(args);
    }
}
