package com.airbnb.airpal.resources.sse;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.api.event.JobEvent;
import com.airbnb.airpal.api.event.JobFinishedEvent;
import com.airbnb.airpal.api.event.JobUpdateEvent;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.core.AirpalUserFactory;
import com.airbnb.airpal.core.AuthorizationUtil;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Iterables;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.common.util.concurrent.RateLimiter;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.eclipse.jetty.servlets.EventSource;
import org.eclipse.jetty.servlets.EventSourceServlet;

import javax.servlet.http.HttpServletRequest;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;

import static com.codahale.metrics.MetricRegistry.name;
import static com.google.common.base.Preconditions.checkNotNull;

@Slf4j
public class SSEEventSourceServlet extends EventSourceServlet
{
    private final JobUpdateToSSERelay jobUpdateToSSERelay;
    private final AirpalUserFactory userFactory;

    @Inject
    public SSEEventSourceServlet(ObjectMapper objectMapper,
            EventBus eventBus,
            @Named("sse") ExecutorService executorService,
            MetricRegistry registry,
            AirpalUserFactory userFactory)
    {
        this.jobUpdateToSSERelay = new JobUpdateToSSERelay(objectMapper, executorService, registry);
        this.userFactory = userFactory;
        eventBus.register(jobUpdateToSSERelay);
    }

    @Override
    protected EventSource newEventSource(HttpServletRequest request)
    {
        SSEEventSource eventSource = new SSEEventSource(jobUpdateToSSERelay);
        Subject subject = SecurityUtils.getSubject();
        jobUpdateToSSERelay.addListener(eventSource, userFactory.getUser(subject));
        return eventSource;
    }

    static class JobUpdateToSSERelay
    {
        private final ObjectMapper objectMapper;
        private final RateLimiter updateLimiter = RateLimiter.create(15.0);
        private final Set<SSEEventSource> subscribers = Collections.newSetFromMap(new ConcurrentHashMap<SSEEventSource, Boolean>());
        private final Map<SSEEventSource, AirpalUser> eventSourceSubjectMap = new ConcurrentHashMap<>();
        private final ExecutorService executorService;
        private final Timer timer;

        public JobUpdateToSSERelay(ObjectMapper objectMapper, ExecutorService executorService, MetricRegistry registry)
        {
            this.objectMapper = checkNotNull(objectMapper, "objectMapper was null");
            this.executorService = checkNotNull(executorService, "executorService was null");
            this.timer = registry.timer(name(AuthorizedEventBroadcast.class, "authorization"));
        }

        public void addListener(SSEEventSource sseEventSource, AirpalUser subject)
        {
            AirpalUser eventSubject = checkNotNull(subject, "subject was null");
            SSEEventSource eventSource = checkNotNull(sseEventSource, "sseEventSource was null");

            subscribers.add(eventSource);
            eventSourceSubjectMap.put(eventSource, eventSubject);
        }

        public void removeListener(SSEEventSource sseEventSource)
        {
            SSEEventSource eventSource = checkNotNull(sseEventSource, "sseEventSource was null");

            subscribers.remove(eventSource);
            eventSourceSubjectMap.remove(eventSource);
        }

        private void broadcast(JobEvent message)
        {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);

                for (SSEEventSource subscriber : subscribers) {
                    executorService.submit(
                            new AuthorizedEventBroadcast(subscriber,
                                    eventSourceSubjectMap.get(subscriber),
                                    jsonMessage,
                                    message.getJob(),
                                    timer));
                }
            }
            catch (JsonProcessingException e) {
                log.error("Could not serialize JobEvent as JSON", e);
            }
        }

        @Subscribe
        public void receiveJobUpdate(JobUpdateEvent event) {
            if (updateLimiter.tryAcquire()) {
                broadcast(event);
            }
        }

        @Subscribe
        public void receiveJobFinished(JobFinishedEvent event) {
            broadcast(event);
        }
    }

    @Value
    private static class AuthorizedEventBroadcast implements Runnable
    {
        private final SSEEventSource eventSource;
        private final AirpalUser subject;
        private final String message;
        private final Job job;
        private final Timer timer;

        @Override
        public void run()
        {
            Timer.Context context = timer.time();
            if (Iterables.all(job.getTablesUsed(), new AuthorizationUtil.AuthorizedTablesPredicate(subject))) {
                eventSource.emit(message);
            }
            context.stop();
        }
    }
}
