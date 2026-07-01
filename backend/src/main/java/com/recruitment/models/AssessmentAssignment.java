package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.models.ids.AssessmentAssignmentId;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessment_assignment")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssessmentAssignment {

    @EmbeddedId
    private AssessmentAssignmentId id = new AssessmentAssignmentId();

    @MapsId("candidateId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @MapsId("assessmentId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, STARTED, SUBMITTED, EXPIRED

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    private Double score;

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentAttempt> attempts = new ArrayList<>();

    public AssessmentAssignment() {}

    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
    }

    public AssessmentAssignmentId getId() {
        return id;
    }

    public void setId(AssessmentAssignmentId id) {
        this.id = id;
    }

    // Expose virtual assignmentId for API compatibility
    public String getAssignmentId() {
        if (id != null && id.getAssessmentId() != null && id.getCandidateId() != null) {
            return id.getAssessmentId() + "_" + id.getCandidateId();
        }
        return null;
    }

    public void setAssignmentId(String assignmentId) {
        if (assignmentId != null && assignmentId.contains("_")) {
            String[] parts = assignmentId.split("_");
            if (parts.length >= 2) {
                ensureId().setAssessmentId(parts[0]);
                ensureId().setCandidateId(parts[1]);
            }
        }
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

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
        if (assessment != null) {
            ensureId().setAssessmentId(assessment.getAssessmentId());
        }
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public List<AssessmentAttempt> getAttempts() {
        return attempts;
    }

    public void setAttempts(List<AssessmentAttempt> attempts) {
        this.attempts = attempts;
    }

    private AssessmentAssignmentId ensureId() {
        if (id == null) {
            id = new AssessmentAssignmentId();
        }
        return id;
    }
}
