package com.recruitment.controllers;

import com.recruitment.models.Report;
import com.recruitment.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<Report> create(@RequestBody Report report) {
        Report created = reportService.createReport(report);

        if (created == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(created);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<Report> getById(@PathVariable String id) {
        return reportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<Report>> getAll() {
        return ResponseEntity.ok(reportService.getAllReport());
    }

    // ================= BY EMPLOYER =================
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Report>> getByEmployer(@PathVariable String employerId) {
        return ResponseEntity.ok(reportService.getReportByEmployer(employerId));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<Report> update(
            @PathVariable String id,
            @RequestBody Report reportUpdate
    ) {
        return reportService.updateReport(id, reportUpdate)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}