package com.recruitment.models.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AssessmentAssignmentId implements Serializable {

    @Column(name = "assessment_id", length = 36)
    private String assessmentId;

    @Column(name = "candidate_id", length = 36)
    private String candidateId;

    public AssessmentAssignmentId() {}

    public AssessmentAssignmentId(String assessmentId, String candidateId) {
        this.assessmentId = assessmentId;
        this.candidateId = candidateId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssessmentAssignmentId that = (AssessmentAssignmentId) o;
        return Objects.equals(assessmentId, that.assessmentId) && Objects.equals(candidateId, that.candidateId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(assessmentId, candidateId);
    }
}
