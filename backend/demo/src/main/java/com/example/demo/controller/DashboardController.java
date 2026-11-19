package com.example.demo.controller;

import java.util.Map;

import com.example.demo.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class DashboardController {
    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/api/dashboard/stats")
    public ResponseEntity<Map<String, Object>> stats(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(dashboard.stats(authorization));
    }
}
