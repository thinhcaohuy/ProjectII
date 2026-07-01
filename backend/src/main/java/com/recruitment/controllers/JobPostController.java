package com.recruitment.controllers;

import com.recruitment.models.JobPost;
import com.recruitment.services.JobPostService;
import com.recruitment.enums.JobPostStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-posts")
public class JobPostController {

    private final JobPostService jobPostService;

    public JobPostController(JobPostService jobPostService) {
        this.jobPostService = jobPostService;
    }

    // ================= CREATE =================
    @PostMapping("/{employerId}")
    public ResponseEntity<JobPost> create(
            @PathVariable String employerId,
            @RequestBody JobPost jobPost
    ) {
        return jobPostService.createJobPost(jobPost, employerId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getById(@PathVariable String id) {
        return jobPostService.getJobPostById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<JobPost>> getAll() {
        return ResponseEntity.ok(jobPostService.getAllJobPosts());
    }

    // ================= BY EMPLOYER =================
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobPost>> getByEmployer(@PathVariable String employerId) {
        return ResponseEntity.ok(jobPostService.getByEmployer(employerId));
    }

    // ================= SEARCH =================
    @GetMapping("/search")
    public ResponseEntity<List<JobPost>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(jobPostService.search(keyword));
    }

    // ================= ADVANCED SEARCH / MARKET =================
    @GetMapping("/search-advanced")
    public ResponseEntity<List<JobPost>> searchAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String status
    ) {
        List<JobPost> all = jobPostService.getAllJobPosts();

        return ResponseEntity.ok(
                all.stream()
                        .filter(j -> {
                            if (keyword != null && !keyword.isBlank()) {
                                String k = keyword.toLowerCase();
                                if (!((j.getTitle() != null && j.getTitle().toLowerCase().contains(k))
                                        || (j.getIndustry() != null && j.getIndustry().toLowerCase().contains(k)))) {
                                    return false;
                                }
                            }

                            if (location != null && !location.isBlank()) {
                                if (!(j.getLocation() != null && j.getLocation().toLowerCase().contains(location.toLowerCase()))) {
                                    return false;
                                }
                            }

                            if (industry != null && !industry.isBlank()) {
                                if (!(j.getIndustry() != null && j.getIndustry().toLowerCase().contains(industry.toLowerCase()))) {
                                    return false;
                                }
                            }

                            if (status != null && !status.isBlank()) {
                                try {
                                    JobPostStatus s = JobPostStatus.valueOf(status.toUpperCase());
                                    if (j.getStatus() != s) return false;
                                } catch (IllegalArgumentException ex) {
                                    return false;
                                }
                            }

                            return true;
                        })
                        .toList()
        );
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<JobPost> update(
            @PathVariable String id,
            @RequestBody JobPost update
    ) {
        return jobPostService.updateJobPost(id, update)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= CLOSE =================
    @PutMapping("/{id}/close")
    public ResponseEntity<JobPost> close(@PathVariable String id) {
        return jobPostService.closeJobPost(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        jobPostService.deleteJobPost(id);
        return ResponseEntity.noContent().build();
    }
}