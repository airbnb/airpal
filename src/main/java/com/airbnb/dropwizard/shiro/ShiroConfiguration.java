package com.airbnb.dropwizard.shiro;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

public class ShiroConfiguration
{
    @JsonProperty
    @Getter
    private final List<String> securedUrls;
    @JsonProperty
    @Getter
    private final List<String> dispatchTypes;
    @JsonProperty
    @Getter
    private final List<String> privilegedGroups;

    @JsonCreator
    public ShiroConfiguration(
            @JsonProperty("securedUrls") List<String> securedUrls,
            @JsonProperty("dispatchTypes") List<String> dispatchTypes,
            @JsonProperty("privilegedGroups") List<String> privilegedGroups)
    {
        this.securedUrls = securedUrls;
        this.dispatchTypes = dispatchTypes;
        this.privilegedGroups = privilegedGroups;
    }
}
