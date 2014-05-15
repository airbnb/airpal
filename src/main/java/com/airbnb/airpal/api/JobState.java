package com.airbnb.airpal.api;

import com.google.common.base.Predicate;

public enum JobState {
    /**
     * Query has been accepted and is awaiting execution.
     */
    QUEUED(false),
    /**
     * Query is being planned.
     */
    PLANNING(false),
    /**
     * Query execution is being started.
     */
    STARTING(false),
    /**
     * Query has at least one task in the output stage.
     */
    RUNNING(false),
    /**
     * Query has finished executing and all output has been consumed.
     */
    FINISHED_EXECUTION(false),
    /**
     * Job has finished forwarding all output to S3/Hive
     */
    FINISHED(true),
    /**
     * Query was canceled by a user.
     */
    CANCELED(true),
    /**
     * Query execution failed.
     */
    FAILED(true);

    private final boolean doneState;

    private JobState(boolean doneState)
    {
        this.doneState = doneState;
    }

    /**
     * Is this a terminal state.
     */
    public boolean isDone()
    {
        return doneState;
    }

    public static Predicate<JobState> inDoneState()
    {
        return new Predicate<JobState>()
        {
            @Override
            public boolean apply(JobState state)
            {
                return state.isDone();
            }
        };
    }

    public static JobState fromStatementState(String statementState) {
        String state = statementState.equalsIgnoreCase("FINISHED") ? "FINISHED_EXECUTION" : statementState;
        return JobState.valueOf(state);
    }
}
