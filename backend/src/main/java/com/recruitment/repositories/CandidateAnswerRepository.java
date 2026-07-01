package com.recruitment.repositories;

import com.recruitment.models.CandidateAnswer;
import com.recruitment.models.ids.CandidateAnswerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, CandidateAnswerId> {
    List<CandidateAnswer> findById_AssessmentIdAndId_CandidateIdAndId_AttemptId(String assessmentId, String candidateId, String attemptId);
    Optional<CandidateAnswer> findById_AssessmentIdAndId_CandidateIdAndId_AttemptIdAndId_QuestionId(
            String assessmentId, String candidateId, String attemptId, String questionId);
}
