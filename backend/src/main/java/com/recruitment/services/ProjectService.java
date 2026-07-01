package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.Project;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CandidateRepository candidateRepository;

    public ProjectService(ProjectRepository projectRepository, CandidateRepository candidateRepository) {
        this.projectRepository = projectRepository;
        this.candidateRepository = candidateRepository;
    }

    // ================= CREATE =================
    public Project save(Project project) {
        if (project == null) return null;

        if (project.getCandidate() == null) {
            String accountId = project.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "accountId is required");
            }

            Candidate candidate = candidateRepository.findById(accountId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Candidate not found"));
            project.setCandidate(candidate);
        }

        return projectRepository.save(project);
    }

    // ================= READ =================
    public Optional<Project> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return projectRepository.findById(id);
    }

    public List<Project> findByAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) return List.of();
        return projectRepository.findByAccountId(accountId);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // ================= DELETE =================
    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            projectRepository.deleteById(id);
        }
    }
}