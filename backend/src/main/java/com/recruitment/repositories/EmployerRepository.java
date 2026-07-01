package com.recruitment.repositories;

import com.recruitment.models.Employer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, String> {

    // Login / auth
    Optional<Employer> findByEmail(String email);

    // Search company name (fuzzy search for recruiter/admin)
    List<Employer> findByCompanyNameContainingIgnoreCase(String companyName);

    // Filter by company size
    List<Employer> findByCompanySize(int companySize);

    // Combined search (admin / directory search)
    List<Employer> findByCompanyNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String companyName,
            String email
    );

    // Optional: active employers (if you add status later)
    // List<Employer> findByStatus(EmployerStatus status);
}