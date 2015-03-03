package com.airbnb.airpal.api.output;

public class InvalidQueryException
        extends Exception
{
    public InvalidQueryException(String message)
    {
        super(message);
    }
}
