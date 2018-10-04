package com.airbnb.airpal.util;

public class ConvertUtils {
    public static boolean toBoolean(Object value) {
        if (value == null || value.toString().trim().isEmpty()) {
            return false;
        }

        if (value instanceof Boolean) {
            return (Boolean) value;
        }

        return Boolean.parseBoolean(value.toString());
    }
}
