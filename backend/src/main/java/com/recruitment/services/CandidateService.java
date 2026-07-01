package com.recruitment.services;

import com.recruitment.dto.CandidateDTO;
import com.recruitment.enums.JobSeekingStatus;
import com.recruitment.models.Candidate;
import com.recruitment.repositories.CandidateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    // ================= READ =================
    public Optional<Candidate> getCandidateById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return candidateRepository.findById(id);
    }

    public Optional<Candidate> getCandidateByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return candidateRepository.findByEmail(email);
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    // ================= UPDATE =================
    public Optional<Candidate> updateCandidate(String id, CandidateDTO update) {

        if (id == null || id.isBlank() || update == null) {
            return Optional.empty();
        }

        return candidateRepository.findById(id)
                .map(c -> {
                    if (update.getEmail() != null && !update.getEmail().isBlank()) {
                        c.setEmail(update.getEmail());
                    }
                    c.setFullName(update.getFullName());
                    c.setPhoneNumber(update.getPhoneNumber());
                    c.setAddress(update.getAddress());
                    c.setAvatarUrl(update.getAvatarUrl());
                    c.setJobSeekingStatus(update.getJobSeekingStatus());
                    c.setUpdatedAt(LocalDateTime.now());
                    return candidateRepository.save(c);
                });
    }

    // ================= DELETE =================
    public void deleteCandidate(String id) {
        if (id == null || id.isBlank()) return;
        candidateRepository.deleteById(id);
    }

    // ================= FILTER =================
    public List<Candidate> getCandidatesByStatus(JobSeekingStatus status) {
        if (status == null) return List.of();
        return candidateRepository.findByJobSeekingStatus(status);
    }
}