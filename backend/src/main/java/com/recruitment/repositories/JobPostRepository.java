package com.recruitment.repositories;

import com.recruitment.models.JobPost;
import com.recruitment.enums.JobPostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, String> {

    // Filter by status (OPEN / CLOSED / PENDING)
    List<JobPost> findByStatus(JobPostStatus status);

    // Find job posts by employer
    List<JobPost> findByEmployer_AccountId(String employerId);

    // Filter by industry
    List<JobPost> findByIndustryContainingIgnoreCase(String industry);

    // Filter by location
    List<JobPost> findByLocationContainingIgnoreCase(String location);

    // Salary range search (ATS feature rất quan trọng)
    List<JobPost> findBySalaryBetween(double minSalary, double maxSalary);

    // Combined search (job search UI)
    List<JobPost> findByTitleContainingIgnoreCaseOrIndustryContainingIgnoreCase(
            String title,
            String industry
    );
}