package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessment_question")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssessmentQuestion {

    @Id
    @Column(name = "question_id", length = 36)
    private String questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    @JsonIgnore
    private Assessment assessment;

    @Column(name = "question_text", columnDefinition = "LONGTEXT", nullable = false)
    private String questionText;

    @Column(name = "correct_option_index", nullable = false)
    private int correctOptionIndex;

    @Column(name = "score_weight", nullable = false)
    private double scoreWeight = 1.0;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<AssessmentOption> options = new ArrayList<>();

    public AssessmentQuestion() {}

    @PrePersist
    protected void onCreate() {
        if (this.questionId == null) {
            this.questionId = java.util.UUID.randomUUID().toString();
        }
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public int getCorrectOptionIndex() {
        return correctOptionIndex;
    }

    public void setCorrectOptionIndex(int correctOptionIndex) {
        this.correctOptionIndex = correctOptionIndex;
    }

    public double getScoreWeight() {
        return scoreWeight;
    }

    public void setScoreWeight(double scoreWeight) {
        this.scoreWeight = scoreWeight;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<AssessmentOption> getOptions() {
        return options;
    }

    public void setOptions(List<AssessmentOption> options) {
        this.options = options;
    }
}
