package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.models.ids.AssessmentOptionId;
import jakarta.persistence.*;

@Entity
@Table(name = "assessment_option")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssessmentOption {

    @EmbeddedId
    private AssessmentOptionId id = new AssessmentOptionId();

    @MapsId("questionId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private AssessmentQuestion question;

    @Column(name = "option_text", columnDefinition = "LONGTEXT", nullable = false)
    private String optionText;

    @Column(name = "option_index", nullable = false)
    private int optionIndex;

    public AssessmentOption() {}

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = new AssessmentOptionId();
        }
        if (this.id.getOptionId() == null) {
            this.id.setOptionId(java.util.UUID.randomUUID().toString());
        }
    }

    public AssessmentOptionId getId() {
        return id;
    }

    public void setId(AssessmentOptionId id) {
        this.id = id;
    }

    public String getOptionId() {
        return id != null ? id.getOptionId() : null;
    }

    public void setOptionId(String optionId) {
        ensureId().setOptionId(optionId);
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

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public int getOptionIndex() {
        return optionIndex;
    }

    public void setOptionIndex(int optionIndex) {
        this.optionIndex = optionIndex;
    }

    private AssessmentOptionId ensureId() {
        if (id == null) {
            id = new AssessmentOptionId();
        }
        return id;
    }
}
