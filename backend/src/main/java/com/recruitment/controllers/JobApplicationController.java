package com.recruitment.controllers;

import com.recruitment.models.JobApplication;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.services.JobApplicationService;
import com.recruitment.services.JobPostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final JobPostService jobPostService;

    public JobApplicationController(JobApplicationService jobApplicationService, JobPostService jobPostService) {
        this.jobApplicationService = jobApplicationService;
        this.jobPostService = jobPostService;
    }

    // ================= APPLY =================
    @PostMapping("/{candidateId}/{jobPostId}")
    public ResponseEntity<JobApplication> apply(
            @PathVariable String candidateId,
            @PathVariable String jobPostId,
            @RequestParam String coverLetter
    ) {
        JobApplication app = jobApplicationService.submitApplication(
                candidateId, jobPostId, coverLetter
        );

        if (app == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(app);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getById(@PathVariable String id) {
        return jobApplicationService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= BY JOB =================
    @GetMapping("/job/{jobPostId}")
    public ResponseEntity<List<JobApplication>> getByJob(@PathVariable String jobPostId,
                                                         @RequestParam(required = false) String requesterId) {
        // If requesterId provided, enforce that requester is the job owner
        if (requesterId != null && !requesterId.isBlank()) {
            return jobPostService.getJobPostById(jobPostId)
                    .map(jobPost -> {
                        String ownerId = jobPost.getEmployer() != null ? jobPost.getEmployer().getAccountId() : null;
                        if (!requesterId.equals(ownerId)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<List<JobApplication>>build();
                        }
                        return ResponseEntity.ok(jobApplicationService.getByJobPost(jobPostId));
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        // No requesterId - return list (caller must handle sensitive data appropriately)
        return ResponseEntity.ok(jobApplicationService.getByJobPost(jobPostId));
    }

    // ================= BY CANDIDATE =================
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplication>> getByCandidate(@PathVariable String candidateId) {
        return ResponseEntity.ok(jobApplicationService.getByCandidate(candidateId));
    }

    // ================= BY STATUS =================
    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobApplication>> getByStatus(@PathVariable ApplicationStatus status) {
        return ResponseEntity.ok(jobApplicationService.getByStatus(status));
    }

    // ================= UPDATE STATUS =================
    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(
            @PathVariable String id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String requesterId
    ) {
        // If requesterId provided, verify ownership of the related job
        if (requesterId != null && !requesterId.isBlank()) {
            return jobApplicationService.getById(id)
                    .map(app -> {
                        String ownerId = app.getJobPost() != null && app.getJobPost().getEmployer() != null
                                ? app.getJobPost().getEmployer().getAccountId() : null;
                        if (!requesterId.equals(ownerId)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<JobApplication>build();
                        }
                        return jobApplicationService.updateStatus(id, status)
                                .map(ResponseEntity::ok)
                                .orElseGet(() -> ResponseEntity.notFound().build());
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        return jobApplicationService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}