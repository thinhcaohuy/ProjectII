package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.models.ids.JobApplicationId;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "application")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class JobApplication {

    @EmbeddedId
    private JobApplicationId id = new JobApplicationId();

    @Column(columnDefinition = "LONGTEXT")
    private String coverLetter;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @MapsId("candidateId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @MapsId("jobPostId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public JobApplication() {}

    public JobApplicationId getId() {
        return id;
    }

    public void setId(JobApplicationId id) {
        this.id = id;
    }

    // Expose virtual applicationId for API/frontend compatibility
    public String getApplicationId() {
        if (id != null && id.getCandidateId() != null && id.getJobPostId() != null) {
            return id.getCandidateId() + "_" + id.getJobPostId();
        }
        return null;
    }

    public void setApplicationId(String applicationId) {
        if (applicationId != null && applicationId.contains("_")) {
            String[] parts = applicationId.split("_");
            if (parts.length >= 2) {
                ensureId().setCandidateId(parts[0]);
                ensureId().setJobPostId(parts[1]);
            }
        }
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
        if (candidate != null) {
            ensureId().setCandidateId(candidate.getAccountId());
        }
    }

    public JobPost getJobPost() {
        return jobPost;
    }

    public void setJobPost(JobPost jobPost) {
        this.jobPost = jobPost;
        if (jobPost != null) {
            ensureId().setJobPostId(jobPost.getJobPostId());
        }
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void updateStatus(ApplicationStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    private JobApplicationId ensureId() {
        if (id == null) {
            id = new JobApplicationId();
        }
        return id;
    }
}