package com.recruitment.models.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AssessmentOptionId implements Serializable {

    @Column(name = "option_id", length = 36)
    private String optionId;

    @Column(name = "question_id", length = 36)
    private String questionId;

    public AssessmentOptionId() {}

    public AssessmentOptionId(String optionId, String questionId) {
        this.optionId = optionId;
        this.questionId = questionId;
    }

    public String getOptionId() {
        return optionId;
    }

    public void setOptionId(String optionId) {
        this.optionId = optionId;
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
        AssessmentOptionId that = (AssessmentOptionId) o;
        return Objects.equals(optionId, that.optionId) && Objects.equals(questionId, that.questionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(optionId, questionId);
    }
}
