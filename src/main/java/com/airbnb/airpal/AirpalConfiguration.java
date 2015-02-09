package com.airbnb.airpal;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.airlift.units.DataSize;
import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.util.Duration;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.secnod.dropwizard.shiro.ShiroConfiguration;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import java.net.URI;
import java.util.List;

public class AirpalConfiguration extends Configuration
{
    @Getter
    @Setter
    @JsonProperty
    private URI prestoCoordinator = null;

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
    private Duration usageWindow = Duration.hours(6);

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
    private HiveMetastoreConfiguration metaStoreConfiguration;

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private List<URI> airpalHosts;

    @Getter
    @Setter
    private DataSize bufferSize = DataSize.valueOf("512kB");

    @Getter
    @Setter
    @JsonProperty
    @NotNull
    private DataSize maxOutputSize = DataSize.valueOf("1GB");

    @Getter
    @Setter
    @Valid
    @JsonProperty
    @NotNull
    private DataSourceFactory dataSourceFactory = new DataSourceFactory();

    @Getter
    @Setter
    @Valid
    @JsonProperty
    @NotNull
    private ShiroConfiguration shiro;

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
