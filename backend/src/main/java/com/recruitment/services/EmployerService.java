package com.recruitment.services;

import com.recruitment.dto.EmployerDTO;
import com.recruitment.models.Employer;
import com.recruitment.repositories.EmployerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EmployerService {

    private final EmployerRepository employerRepository;

    public EmployerService(EmployerRepository employerRepository) {
        this.employerRepository = employerRepository;
    }

    // ================= READ =================
    public Optional<Employer> getEmployerById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return employerRepository.findById(id);
    }

    public Optional<Employer> getEmployerByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return employerRepository.findByEmail(email);
    }

    public List<Employer> getAllEmployer() {
        return employerRepository.findAll();
    }

    // ================= UPDATE =================
    public Optional<Employer> updateEmployer(String id, EmployerDTO update) {

        if (id == null || id.isBlank() || update == null) {
            return Optional.empty();
        }

        return employerRepository.findById(id)
                .map(e -> {
                    if (update.getEmail() != null && !update.getEmail().isBlank()) {
                        e.setEmail(update.getEmail());
                    }
                    e.setCompanyName(update.getCompanyName());
                    e.setAddress(update.getAddress());
                    e.setCompanySize(update.getCompanySize());
                    e.setWebsite(update.getWebsite());
                    e.setDescription(update.getDescription());
                    e.setUpdatedAt(LocalDateTime.now());
                    return employerRepository.save(e);
                });
    }

    // ================= DELETE =================
    public void deleteEmployer(String id) {
        if (id == null || id.isBlank()) return;
        employerRepository.deleteById(id);
    }

    // ================= SEARCH =================
    public List<Employer> searchByCompanyName(String name) {
        if (name == null || name.isBlank()) return List.of();
        return employerRepository.findByCompanyNameContainingIgnoreCase(name);
    }
}