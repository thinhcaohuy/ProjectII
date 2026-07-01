package com.recruitment.repositories;

import com.recruitment.models.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, String> {
    List<Assessment> findByEmployer_AccountId(String employerId);
}
