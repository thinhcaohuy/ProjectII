package com.recruitment.repositories;

import com.recruitment.models.AssessmentAttempt;
import com.recruitment.models.ids.AssessmentAttemptId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, AssessmentAttemptId> {
    List<AssessmentAttempt> findById_AssessmentIdAndId_CandidateId(String assessmentId, String candidateId);
}
