package com.airbnb.airpal.service;

import io.dropwizard.views.View;

public class LoginView extends View
{
    private static String TEMPLATE_NAME = "login.ftl";

    public LoginView()
    {
        super(TEMPLATE_NAME);
    }
}
