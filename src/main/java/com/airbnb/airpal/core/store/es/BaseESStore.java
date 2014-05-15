package com.airbnb.airpal.core.store.es;

import com.airbnb.airpal.core.ManagedESClient;
import org.elasticsearch.client.Client;

public abstract class BaseESStore
{
    private final ManagedESClient managedNode;
    private Client client;

    public BaseESStore(ManagedESClient managedNode)
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
