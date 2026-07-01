package com.recruitment.repositories;

import com.recruitment.models.AssessmentOption;
import com.recruitment.models.ids.AssessmentOptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentOptionRepository extends JpaRepository<AssessmentOption, AssessmentOptionId> {
}
