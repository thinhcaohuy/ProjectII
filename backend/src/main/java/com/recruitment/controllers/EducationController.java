package com.recruitment.controllers;

import com.recruitment.dto.EducationDTO;
import com.recruitment.models.Education;
import com.recruitment.services.EducationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/education")
public class EducationController {

    @Autowired
    private EducationService educationService;

    @PostMapping
    public ResponseEntity<EducationDTO> createEducation(@RequestBody EducationDTO educationDTO) {
        Education education = new Education();
        education.setSchoolName(educationDTO.getSchoolName());
        education.setMajor(educationDTO.getMajor());
        education.setDegree(educationDTO.getDegree());
        education.setGraduationYear(educationDTO.getGraduationYear());
        education.setAccountId(educationDTO.getAccountId());
        if (educationDTO.getEducationId() != null && !educationDTO.getEducationId().isBlank()) {
            education.setEducationId(educationDTO.getEducationId());
        }

        Education savedEducation = educationService.save(education);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedEducation));
    }

    @GetMapping("/{accountId}/{educationId}")
    public ResponseEntity<EducationDTO> getEducation(
            @PathVariable String accountId,
            @PathVariable String educationId) {
        Education education = educationService.findById(educationId).orElse(null);
        if (education == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDTO(education));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<EducationDTO>> getEducationsByAccount(@PathVariable String accountId) {
        List<Education> educations = educationService.findByAccountId(accountId);
        return ResponseEntity.ok(educations.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{accountId}/{educationId}")
    public ResponseEntity<EducationDTO> updateEducation(
            @PathVariable String accountId,
            @PathVariable String educationId,
            @RequestBody EducationDTO educationDTO) {
        Education education = educationService.findById(educationId).orElse(null);
        if (education == null) {
            return ResponseEntity.notFound().build();
        }

        education.setSchoolName(educationDTO.getSchoolName());
        education.setMajor(educationDTO.getMajor());
        education.setDegree(educationDTO.getDegree());
        education.setGraduationYear(educationDTO.getGraduationYear());

        Education updatedEducation = educationService.save(education);
        return ResponseEntity.ok(toDTO(updatedEducation));
    }

    @DeleteMapping("/{accountId}/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable String accountId,
            @PathVariable String educationId) {
        educationService.deleteById(educationId);
        return ResponseEntity.noContent().build();
    }

    private EducationDTO toDTO(Education education) {
        EducationDTO dto = new EducationDTO();
        dto.setAccountId(education.getAccountId());
        dto.setEducationId(education.getEducationId());
        dto.setSchoolName(education.getSchoolName());
        dto.setMajor(education.getMajor());
        dto.setDegree(education.getDegree());
        dto.setGraduationYear(education.getGraduationYear());
        return dto;
    }
}
