package com.recruitment.repositories;

import com.recruitment.models.AssessmentAssignment;
import com.recruitment.models.ids.AssessmentAssignmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentAssignmentRepository extends JpaRepository<AssessmentAssignment, AssessmentAssignmentId> {
    List<AssessmentAssignment> findByCandidate_AccountId(String candidateId);
    List<AssessmentAssignment> findByAssessment_Employer_AccountId(String employerId);
    List<AssessmentAssignment> findByAssessment_AssessmentId(String assessmentId);
}
