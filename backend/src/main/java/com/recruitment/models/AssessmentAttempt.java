package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.models.ids.AssessmentAttemptId;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessment_attempt")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssessmentAttempt {

    @EmbeddedId
    private AssessmentAttemptId id = new AssessmentAttemptId();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "assessment_id", referencedColumnName = "assessment_id", insertable = false, updatable = false),
        @JoinColumn(name = "candidate_id", referencedColumnName = "candidate_id", insertable = false, updatable = false)
    })
    @JsonIgnore
    private AssessmentAssignment assignment;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber = 1;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    private Double score;

    @Column(nullable = false)
    private String status = "STARTED"; // STARTED, SUBMITTED, EXPIRED

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateAnswer> answers = new ArrayList<>();

    public AssessmentAttempt() {}

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = new AssessmentAttemptId();
        }
        if (this.id.getAttemptId() == null) {
            this.id.setAttemptId(java.util.UUID.randomUUID().toString());
        }
        this.startedAt = LocalDateTime.now();
    }

    public AssessmentAttemptId getId() {
        return id;
    }

    public void setId(AssessmentAttemptId id) {
        this.id = id;
    }

    public String getAttemptId() {
        return id != null ? id.getAttemptId() : null;
    }

    public void setAttemptId(String attemptId) {
        ensureId().setAttemptId(attemptId);
    }

    public AssessmentAssignment getAssignment() {
        return assignment;
    }

    public void setAssignment(AssessmentAssignment assignment) {
        this.assignment = assignment;
        if (assignment != null) {
            ensureId().setAssessmentId(assignment.getAssessment().getAssessmentId());
            ensureId().setCandidateId(assignment.getCandidate().getAccountId());
        }
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<CandidateAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<CandidateAnswer> answers) {
        this.answers = answers;
    }

    private AssessmentAttemptId ensureId() {
        if (id == null) {
            id = new AssessmentAttemptId();
        }
        return id;
    }
}
