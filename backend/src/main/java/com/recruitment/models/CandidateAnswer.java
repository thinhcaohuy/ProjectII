package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.models.ids.CandidateAnswerId;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate_answer")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CandidateAnswer {

    @EmbeddedId
    private CandidateAnswerId id = new CandidateAnswerId();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "assessment_id", referencedColumnName = "assessment_id", insertable = false, updatable = false),
        @JoinColumn(name = "candidate_id", referencedColumnName = "candidate_id", insertable = false, updatable = false),
        @JoinColumn(name = "attempt_id", referencedColumnName = "attempt_id", insertable = false, updatable = false)
    })
    @JsonIgnore
    private AssessmentAttempt attempt;

    @MapsId("questionId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "selected_option_index", nullable = false)
    private int selectedOptionIndex;

    public CandidateAnswer() {}

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = new CandidateAnswerId();
        }
        if (this.id.getCandidateAnswerId() == null) {
            this.id.setCandidateAnswerId(java.util.UUID.randomUUID().toString());
        }
    }

    public CandidateAnswerId getId() {
        return id;
    }

    public void setId(CandidateAnswerId id) {
        this.id = id;
    }

    public String getCandidateAnswerId() {
        return id != null ? id.getCandidateAnswerId() : null;
    }

    public void setCandidateAnswerId(String candidateAnswerId) {
        ensureId().setCandidateAnswerId(candidateAnswerId);
    }

    public AssessmentAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(AssessmentAttempt attempt) {
        this.attempt = attempt;
        if (attempt != null) {
            ensureId().setAssessmentId(attempt.getId().getAssessmentId());
            ensureId().setCandidateId(attempt.getId().getCandidateId());
            ensureId().setAttemptId(attempt.getId().getAttemptId());
        }
    }

    public AssessmentQuestion getQuestion() {
        return question;
    }

    public void setQuestion(AssessmentQuestion question) {
        this.question = question;
        if (question != null) {
            ensureId().setQuestionId(question.getQuestionId());
        }
    }

    public int getSelectedOptionIndex() {
        return selectedOptionIndex;
    }

    public void setSelectedOptionIndex(int selectedOptionIndex) {
        this.selectedOptionIndex = selectedOptionIndex;
    }

    private CandidateAnswerId ensureId() {
        if (id == null) {
            id = new CandidateAnswerId();
        }
        return id;
    }
}
