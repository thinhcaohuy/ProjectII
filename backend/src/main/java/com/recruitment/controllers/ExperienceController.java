package com.recruitment.controllers;

import com.recruitment.dto.ExperienceDTO;
import com.recruitment.models.Experience;
import com.recruitment.services.ExperienceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/experience")
public class ExperienceController {

    @Autowired
    private ExperienceService experienceService;

    @PostMapping
    public ResponseEntity<ExperienceDTO> createExperience(@RequestBody ExperienceDTO experienceDTO) {
        Experience experience = new Experience();
        experience.setCompanyName(experienceDTO.getCompanyName());
        experience.setPosition(experienceDTO.getPosition());
        experience.setJobDescription(experienceDTO.getJobDescription());
        experience.setDuration(experienceDTO.getDuration());
        experience.setAccountId(experienceDTO.getAccountId());
        if (experienceDTO.getExperienceId() != null && !experienceDTO.getExperienceId().isBlank()) {
            experience.setExperienceId(experienceDTO.getExperienceId());
        }

        Experience savedExperience = experienceService.save(experience);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedExperience));
    }

    @GetMapping("/{accountId}/{experienceId}")
    public ResponseEntity<ExperienceDTO> getExperience(
            @PathVariable String accountId,
            @PathVariable String experienceId) {
        Experience experience = experienceService.findById(experienceId).orElse(null);
        if (experience == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDTO(experience));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<ExperienceDTO>> getExperiencesByAccount(@PathVariable String accountId) {
        List<Experience> experiences = experienceService.findByAccountId(accountId);
        return ResponseEntity.ok(experiences.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{accountId}/{experienceId}")
    public ResponseEntity<ExperienceDTO> updateExperience(
            @PathVariable String accountId,
            @PathVariable String experienceId,
            @RequestBody ExperienceDTO experienceDTO) {
        Experience experience = experienceService.findById(experienceId).orElse(null);
        if (experience == null) {
            return ResponseEntity.notFound().build();
        }

        experience.setCompanyName(experienceDTO.getCompanyName());
        experience.setPosition(experienceDTO.getPosition());
        experience.setJobDescription(experienceDTO.getJobDescription());
        experience.setDuration(experienceDTO.getDuration());

        Experience updatedExperience = experienceService.save(experience);
        return ResponseEntity.ok(toDTO(updatedExperience));
    }

    @DeleteMapping("/{accountId}/{experienceId}")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable String accountId,
            @PathVariable String experienceId) {
        experienceService.deleteById(experienceId);
        return ResponseEntity.noContent().build();
    }

    private ExperienceDTO toDTO(Experience experience) {
        ExperienceDTO dto = new ExperienceDTO();
        dto.setAccountId(experience.getAccountId());
        dto.setExperienceId(experience.getExperienceId());
        dto.setCompanyName(experience.getCompanyName());
        dto.setPosition(experience.getPosition());
        dto.setJobDescription(experience.getJobDescription());
        dto.setDuration(experience.getDuration());
        return dto;
    }
}
