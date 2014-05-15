package com.airbnb.airpal.api;

import com.google.common.collect.ForwardingBlockingDeque;

import java.util.concurrent.BlockingDeque;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

public class EvictingDeque<E> extends ForwardingBlockingDeque<E>
{
    private final LinkedBlockingDeque<E> blockingDeque;

    public EvictingDeque(final int capacity)
    {
        this.blockingDeque = new LinkedBlockingDeque<>(capacity);
    }

    @Override
    public void put(E e) throws InterruptedException
    {
        this.add(e);
    }

    @Override
    public boolean offer(E e, long timeout, TimeUnit unit) throws InterruptedException
    {
        return this.add(e);
    }

    @Override
    public boolean add(E element)
    {
        final boolean initialResult = blockingDeque.offer(element);
        return initialResult || (evictItem(blockingDeque) && add(element));
    }

    @Override
    protected BlockingDeque<E> delegate()
    {
        return blockingDeque;
    }

    protected boolean evictItem(LinkedBlockingDeque<E> deque)
    {
        return deque.remove() != null;
    }
}
