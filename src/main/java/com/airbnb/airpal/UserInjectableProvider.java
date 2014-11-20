package com.airbnb.airpal;

import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AirpalUserFactory;
import com.sun.jersey.spi.inject.Injectable;
import lombok.Value;
import org.apache.shiro.SecurityUtils;
import org.secnod.shiro.jersey.AuthInjectableProvider;

public class UserInjectableProvider extends AuthInjectableProvider<AirpalUser>
{
    private final AirpalUserInjectable userInjectable;

    public UserInjectableProvider(AirpalUserFactory userFactory)
    {
        super(AirpalUser.class);

        this.userInjectable = new AirpalUserInjectable(userFactory);
    }

    @Value
    private static class AirpalUserInjectable implements Injectable<AirpalUser>
    {
        private final AirpalUserFactory userFactory;

        @Override
        public AirpalUser getValue()
        {
            return userFactory.getUser(SecurityUtils.getSubject());
        }
    }

    @Override
    protected Injectable<AirpalUser> getInjectable()
    {
        return userInjectable;
    }
}
