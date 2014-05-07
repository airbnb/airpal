package com.airbnb.airpal.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.lifecycle.Managed;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;

import java.util.List;

import static com.airbnb.airpal.AirpalConfiguration.ElasticSearchConfiguration;

/**
 * Author: @andykram
 */
public class ManagedNode implements Managed
{
    private final ObjectMapper mapper;
    private final ElasticSearchConfiguration configuration;
    Node node;

    public ManagedNode(ElasticSearchConfiguration configuration,
                       ObjectMapper mapper)
    {
        this.configuration = configuration;
        this.mapper = mapper;
    }

    public Client client()
    {
        if (node != null) {
            return node.client();
        } else {
            return null;
        }
    }

    @Override
    public void start() throws Exception
    {
        List<String> hosts = configuration.getHosts();
        final ImmutableSettings.Builder builder = ImmutableSettings
                .builder()
                .putArray("discovery.zen.ping.unicast.hosts", hosts.toArray(new String[hosts.size()]))
                .put("cluster.name", configuration.getClusterName())
                .put("discovery.zen.ping.multicast.enabled", configuration.getMulticastEnabled())
                .put("processors", 3);

        Settings settings = builder.build();


        this.node = NodeBuilder.nodeBuilder()
                               .client(true)
                               .settings(settings)
                               .node();
    }

    @Override
    public void stop() throws Exception {
        if (node != null) {
            node.close();
        }
    }
}
