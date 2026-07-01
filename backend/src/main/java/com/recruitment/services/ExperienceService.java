package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.Experience;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.ExperienceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final CandidateRepository candidateRepository;

    public ExperienceService(ExperienceRepository experienceRepository, CandidateRepository candidateRepository) {
        this.experienceRepository = experienceRepository;
        this.candidateRepository = candidateRepository;
    }

    // ================= CREATE =================
    public Experience save(Experience experience) {
        if (experience == null) return null;

        if (experience.getCandidate() == null) {
            String accountId = experience.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "accountId is required");
            }

            Candidate candidate = candidateRepository.findById(accountId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Candidate not found"));
            experience.setCandidate(candidate);
        }

        return experienceRepository.save(experience);
    }

    // ================= READ =================
    public Optional<Experience> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return experienceRepository.findById(id);
    }

    public List<Experience> findByAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) return List.of();
        return experienceRepository.findByAccountId(accountId);
    }

    public List<Experience> getAllExperience() {
        return experienceRepository.findAll();
    }

    // ================= DELETE =================
    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            experienceRepository.deleteById(id);
        }
    }
}