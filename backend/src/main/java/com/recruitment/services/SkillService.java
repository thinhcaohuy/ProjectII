package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.Skill;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final CandidateRepository candidateRepository;

    public SkillService(SkillRepository skillRepository, CandidateRepository candidateRepository) {
        this.skillRepository = skillRepository;
        this.candidateRepository = candidateRepository;
    }

    // ================= CREATE =================
    public Skill save(Skill skill) {
        if (skill == null) return null;

        if (skill.getCandidate() == null) {
            String accountId = skill.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "accountId is required");
            }

            Candidate candidate = candidateRepository.findById(accountId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Candidate not found"));
            skill.setCandidate(candidate);
        }

        return skillRepository.save(skill);
    }

    // ================= READ =================
    public Optional<Skill> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return skillRepository.findById(id);
    }

    public List<Skill> findByAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) return List.of();
        return skillRepository.findByAccountId(accountId);
    }

    public List<Skill> getAllSkill() {
        return skillRepository.findAll();
    }

    // ================= DELETE =================
    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            skillRepository.deleteById(id);
        }
    }
}