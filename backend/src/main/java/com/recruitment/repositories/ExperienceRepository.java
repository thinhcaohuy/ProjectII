package com.recruitment.repositories;

import com.recruitment.models.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, String> {

    @Query("SELECT ex FROM Experience ex WHERE ex.candidate.accountId = :accountId")
    List<Experience> findByAccountId(String accountId);

    List<Experience> findByCompanyNameContainingIgnoreCase(String companyName);

    List<Experience> findByPositionContainingIgnoreCase(String position);

    List<Experience> findByDurationContainingIgnoreCase(String duration);

    List<Experience> findByCompanyNameContainingIgnoreCaseOrPositionContainingIgnoreCase(
            String companyName,
            String position
    );
}