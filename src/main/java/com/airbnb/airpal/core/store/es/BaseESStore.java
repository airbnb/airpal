package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.core.ManagedNode;
import org.elasticsearch.client.Client;

/**
 * Author: @andykram
 */
public abstract class BaseESStore
{
    private final ManagedNode managedNode;
    private Client client;

    public BaseESStore(ManagedNode managedNode)
    {
        this.client = managedNode.client();
        this.managedNode = managedNode;
    }

    protected Client client()
    {
        if (client == null) {
            this.client = managedNode.client();
        }

        return this.client;
    }
}
