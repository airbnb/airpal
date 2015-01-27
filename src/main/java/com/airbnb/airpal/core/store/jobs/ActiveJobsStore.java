package com.airbnb.airpal.core.store.jobs;

import com.airbnb.airpal.api.Job;
import com.airbnb.airpal.core.AirpalUser;

import java.util.Set;

/**
 * A store for currently running jobs.
 */
public interface ActiveJobsStore
{
    /**
     * Get all running jobs for the specified user.
     * @param user The user to retrieve jobs for.
     * @return All currently running jobs for this user.
     */
    public Set<Job> getJobsForUser(AirpalUser user);

    /**
     * Mark a job as having started.
     * @param job The job that has started.
     */
    public void jobStarted(Job job);

    /**
     * Mark a job as having finished.
     * @param job The job that has finished.
     */
    public void jobFinished(Job job);
}
