package com.airbnb.airpal.core.store.jobs;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.core.AirpalUser;
import com.google.common.collect.ImmutableSet;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class InMemoryActiveJobsStore implements ActiveJobsStore
{
    private ConcurrentMap<String, Set<Job>> activeJobs = new ConcurrentHashMap<>();

    @Override
    public Set<Job> getJobsForUser(AirpalUser user)
    {
        if (!activeJobs.containsKey(user.getUserName())) {
            return Collections.emptySet();
        }

        return ImmutableSet.copyOf(activeJobs.get(user.getUserName()));
    }

    @Override
    public void jobStarted(Job job)
    {
        Set<Job> jobsForUser = activeJobs.get(job.getUser());

        if (jobsForUser == null) {
            jobsForUser = Collections.newSetFromMap(new ConcurrentHashMap<Job, Boolean>());
            activeJobs.putIfAbsent(job.getUser(), jobsForUser);
        }

        activeJobs.get(job.getUser()).add(job);
    }

    @Override
    public void jobFinished(Job job)
    {
        Set<Job> jobsForUser = activeJobs.get(job.getUser());

        if (jobsForUser == null) {
            return;
        }

        jobsForUser.remove(job);
    }
}
