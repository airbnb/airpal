package com.airbnb.airpal.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.net.HostAndPort;
import io.dropwizard.lifecycle.Managed;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;

import java.util.List;

import static com.airbnb.airpal.AirpalConfiguration.ElasticSearchConfiguration;

public class ManagedESClient
        implements Managed
{
    private final ObjectMapper mapper;
    private final ElasticSearchConfiguration configuration;
    private TransportClient client;

    public ManagedESClient(ElasticSearchConfiguration configuration,
            ObjectMapper mapper)
    {
        this.configuration = configuration;
        this.mapper = mapper;
    }

    public Client client()
    {
        return this.client;
    }

    @Override
    public void start() throws Exception
    {
        List<String> hosts = configuration.getHosts();
        final ImmutableSettings.Builder builder = ImmutableSettings
                .builder()
                .put("cluster.name", configuration.getClusterName())
                .put("processors", 3);

        TransportClient client = new TransportClient(builder);

        for (String host : hosts) {
            HostAndPort hostAndPort = HostAndPort.fromString(host);
            client.addTransportAddress(new InetSocketTransportAddress(hostAndPort.getHostText(), hostAndPort.getPort()));
        }

        this.client = client;
    }

    @Override
    public void stop() throws Exception {
        client.close();
    }
}
