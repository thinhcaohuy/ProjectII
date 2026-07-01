package com.recruitment.repositories;

import com.recruitment.models.JobApplication;
import com.recruitment.models.ids.JobApplicationId;
import com.recruitment.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, JobApplicationId> {

    // Get all applications for a job post with eager loading
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "WHERE app.jobPost.jobPostId = :jobPostId " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findByJobPost_JobPostId(@Param("jobPostId") String jobPostId);

    // Get all applications by candidate with eager loading
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "WHERE app.candidate.accountId = :candidateId " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findByCandidate_AccountId(@Param("candidateId") String candidateId);

    // Filter by application status
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "WHERE app.status = :status " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findByStatus(@Param("status") ApplicationStatus status);

    // Check duplicate application (VERY IMPORTANT in ATS)
    Optional<JobApplication> findByCandidate_AccountIdAndJobPost_JobPostId(
            String candidateId,
            String jobPostId
    );

    // Filter by submission date (analytics / reporting)
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "WHERE app.appliedAt > :dateTime " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findByAppliedAtAfter(@Param("dateTime") LocalDateTime dateTime);

    // Latest applications first (recruiter dashboard)
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findAllByOrderByAppliedAtDesc();

    // Applications per job sorted by newest (with eager loading)
    @Query("SELECT app FROM JobApplication app " +
           "JOIN FETCH app.candidate " +
           "JOIN FETCH app.jobPost " +
           "WHERE app.jobPost.jobPostId = :jobPostId " +
           "ORDER BY app.appliedAt DESC")
    List<JobApplication> findByJobPost_JobPostIdOrderByAppliedAtDesc(@Param("jobPostId") String jobPostId);
}