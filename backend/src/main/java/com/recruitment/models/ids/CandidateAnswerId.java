package com.recruitment.models.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CandidateAnswerId implements Serializable {

    @Column(name = "candidate_answer_id", length = 36)
    private String candidateAnswerId;

    @Column(name = "assessment_id", length = 36)
    private String assessmentId;

    @Column(name = "candidate_id", length = 36)
    private String candidateId;

    @Column(name = "attempt_id", length = 36)
    private String attemptId;

    @Column(name = "question_id", length = 36)
    private String questionId;

    public CandidateAnswerId() {}

    public CandidateAnswerId(String candidateAnswerId, String assessmentId, String candidateId, String attemptId, String questionId) {
        this.candidateAnswerId = candidateAnswerId;
        this.assessmentId = assessmentId;
        this.candidateId = candidateId;
        this.attemptId = attemptId;
        this.questionId = questionId;
    }

    public String getCandidateAnswerId() {
        return candidateAnswerId;
    }

    public void setCandidateAnswerId(String candidateAnswerId) {
        this.candidateAnswerId = candidateAnswerId;
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

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CandidateAnswerId that = (CandidateAnswerId) o;
        return Objects.equals(candidateAnswerId, that.candidateAnswerId) &&
                Objects.equals(assessmentId, that.assessmentId) &&
                Objects.equals(candidateId, that.candidateId) &&
                Objects.equals(attemptId, that.attemptId) &&
                Objects.equals(questionId, that.questionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidateAnswerId, assessmentId, candidateId, attemptId, questionId);
    }
}
