package com.example.demo.dto;

import org.springframework.http.HttpStatus;

public record ApiResult<T>(HttpStatus status, T body) {
    public static <T> ApiResult<T> ok(T body) {
        return new ApiResult<>(HttpStatus.OK, body);
    }

    public static <T> ApiResult<T> created(T body) {
        return new ApiResult<>(HttpStatus.CREATED, body);
    }

    public static ApiResult<java.util.Map<String, Object>> error(HttpStatus status, String message) {
        return new ApiResult<>(status, java.util.Map.of("message", message));
    }
}
