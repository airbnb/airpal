package com.airbnb.airpal;

import com.airbnb.dropwizard.shiro.ShiroConfiguration;
import com.airbnb.dropwizard.shiro.WithShiroConfiguration;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.airlift.units.DataSize;
import io.dropwizard.Configuration;
import io.dropwizard.util.Duration;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;

import java.net.URI;
import java.util.List;

/**
 * Author: @andykram
 */
public class AirpalConfiguration extends Configuration
        implements WithShiroConfiguration
{
    @Getter
    @Setter
    @JsonProperty
    private URI prestoCoordinator = null;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private URI discoveryServer;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String prestoUser = "andykram";

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String prestoSource = "airpal";

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String prestoCatalog = "hive";

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String prestoSchema = "default";

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private boolean prestoDebug = false;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private Duration usageWindow = Duration.hours(24);

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String s3SecretKey;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String s3AccessKey;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private String s3Bucket;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private ElasticSearchConfiguration elasticSearchProperties;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private HiveMetastoreConfiguration metaStoreConfiguration;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private ShiroConfiguration shiroConfiguration;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private List<URI> airpalHosts;

    @Getter
    @Setter
    private DataSize bufferSize = DataSize.valueOf("512kB");

    public static class ElasticSearchConfiguration
    {
        @Getter
        @JsonProperty
        @NotNull
        private final List<String> hosts;

        @Getter
        @JsonProperty
        @NotNull
        private final String clusterName;

        @Getter
        @JsonProperty
        @NotNull
        private final Boolean multicastEnabled;

        @JsonCreator
        public ElasticSearchConfiguration(@JsonProperty("hosts") List<String> hosts,
                                          @JsonProperty("clusterName") String clusterName,
                                          @JsonProperty("multicastEnabled") Boolean multicastEnabled)
        {
            this.hosts = hosts;
            this.clusterName = clusterName;
            this.multicastEnabled = multicastEnabled;
        }
    }

    @AllArgsConstructor
    @NoArgsConstructor
    public static class HiveMetastoreConfiguration
    {
        @Getter
        @Setter
        @JsonProperty
        @NotNull
        private String driverName;

        @Getter
        @Setter
        @JsonProperty
        @NotNull
        private String connectionUrl;

        @Getter
        @Setter
        @JsonProperty
        @NotNull
        private String userName;

        @Getter
        @Setter
        @JsonProperty
        @NotNull
        private String password;
    }
}
