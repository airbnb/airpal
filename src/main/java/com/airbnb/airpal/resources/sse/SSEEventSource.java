package com.airbnb.airpal.resources.sse;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.servlets.EventSource;

import java.io.IOException;

import static com.airbnb.airpal.resources.sse.SSEEventSourceServlet.JobUpdateToSSERelay;
import static com.google.common.base.Preconditions.checkNotNull;

@Slf4j
public class SSEEventSource implements EventSource
{
    private final JobUpdateToSSERelay jobUpdateToSSERelay;
    private Emitter emitter;

    public SSEEventSource(JobUpdateToSSERelay jobUpdateToSSERelay)
    {
        this.jobUpdateToSSERelay = checkNotNull(jobUpdateToSSERelay, "jobUpdateToSSERelay was null");
    }

    @Override
    public void onOpen(Emitter emitter)
            throws IOException
    {
        this.emitter = checkNotNull(emitter, "emitter was null");
    }

    @Override
    public void onClose()
    {
        jobUpdateToSSERelay.removeListener(this);
        this.emitter = null;
    }

    public void emit(String message)
    {
        if (emitter != null) {
            try {
                emitter.data(message);
            }
            catch (IOException e) {
                log.error("Could not send data to SSEEventSource", e);
                jobUpdateToSSERelay.removeListener(this);
            }
        } else {
            log.error("Emitter was closed, could not emit message!");
        }
    }
}
