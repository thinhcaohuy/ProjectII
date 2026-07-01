package com.recruitment.models.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AssessmentAttemptId implements Serializable {

    @Column(name = "assessment_id", length = 36)
    private String assessmentId;

    @Column(name = "candidate_id", length = 36)
    private String candidateId;

    @Column(name = "attempt_id", length = 36)
    private String attemptId;

    public AssessmentAttemptId() {}

    public AssessmentAttemptId(String assessmentId, String candidateId, String attemptId) {
        this.assessmentId = assessmentId;
        this.candidateId = candidateId;
        this.attemptId = attemptId;
    }

    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(String attemptId) {
        this.attemptId = attemptId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssessmentAttemptId that = (AssessmentAttemptId) o;
        return Objects.equals(assessmentId, that.assessmentId) &&
                Objects.equals(candidateId, that.candidateId) &&
                Objects.equals(attemptId, that.attemptId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(assessmentId, candidateId, attemptId);
    }
}
