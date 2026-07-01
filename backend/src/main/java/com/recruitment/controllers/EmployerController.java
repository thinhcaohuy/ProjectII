package com.recruitment.controllers;

import com.recruitment.dto.EmployerDTO;
import com.recruitment.models.Employer;
import com.recruitment.services.EmployerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employers")
public class EmployerController {

    private final EmployerService employerService;

    public EmployerController(EmployerService employerService) {
        this.employerService = employerService;
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<EmployerDTO> getById(@PathVariable String id) {

        return employerService.getEmployerById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<EmployerDTO>> getAll() {

        List<EmployerDTO> result = employerService.getAllEmployer()
                .stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(result);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<EmployerDTO> update(
            @PathVariable String id,
            @RequestBody EmployerDTO request
    ) {
        return employerService.updateEmployer(id, request)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        employerService.deleteEmployer(id);
        return ResponseEntity.noContent().build();
    }

    // ================= MAPPER =================
    private EmployerDTO toDTO(Employer e) {
        EmployerDTO dto = new EmployerDTO();

        dto.setAccountId(e.getAccountId());
        dto.setEmail(e.getEmail());
        dto.setUserType(e.getUserType());
        dto.setAddress(e.getAddress());
        dto.setCompanyName(e.getCompanyName());
        dto.setAddress(e.getAddress());
        dto.setCompanySize(e.getCompanySize());
        dto.setWebsite(e.getWebsite());
        dto.setDescription(e.getDescription());

        return dto;
    }
}