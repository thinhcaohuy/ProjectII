package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.Education;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.EducationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class EducationService {

    private final EducationRepository educationRepository;
    private final CandidateRepository candidateRepository;

    public EducationService(EducationRepository educationRepository, CandidateRepository candidateRepository) {
        this.educationRepository = educationRepository;
        this.candidateRepository = candidateRepository;
    }

    // ================= CREATE =================
    public Education save(Education education) {
        if (education == null) return null;

        if (education.getCandidate() == null) {
            String accountId = education.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "accountId is required");
            }

            Candidate candidate = candidateRepository.findById(accountId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Candidate not found"));
            education.setCandidate(candidate);
        }

        return educationRepository.save(education);
    }

    // ================= READ =================
    public Optional<Education> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return educationRepository.findById(id);
    }

    public List<Education> findByAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) return List.of();
        return educationRepository.findByAccountId(accountId);
    }

    public List<Education> getAllEducation() {
        return educationRepository.findAll();
    }

    // ================= DELETE =================
    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            educationRepository.deleteById(id);
        }
    }
}