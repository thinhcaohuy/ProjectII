package com.recruitment.repositories;

import com.recruitment.models.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, String> {
    List<AssessmentQuestion> findByAssessment_AssessmentId(String assessmentId);
}
