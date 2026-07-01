package com.recruitment.repositories;

import com.recruitment.models.Candidate;
import com.recruitment.enums.JobSeekingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, String> {

    Optional<Candidate> findByEmail(String email);

    List<Candidate> findByFullNameContainingIgnoreCase(String fullName);

    // FIX: đúng field trong entity
    List<Candidate> findByJobSeekingStatus(JobSeekingStatus status);

    List<Candidate> findByAddressContainingIgnoreCase(String address);

    List<Candidate> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName,
            String email
    );

    List<Candidate> findByJobSeekingStatusAndEmailIsNotNull(JobSeekingStatus status);
}