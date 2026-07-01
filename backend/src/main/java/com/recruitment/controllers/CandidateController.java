package com.recruitment.controllers;

import com.recruitment.dto.CandidateDTO;
import com.recruitment.models.Candidate;
import com.recruitment.services.CandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<CandidateDTO> getById(@PathVariable String id) {

        return candidateService.getCandidateById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<CandidateDTO>> getAll() {

        List<CandidateDTO> result = candidateService.getAllCandidates()
                .stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(result);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<CandidateDTO> update(
            @PathVariable String id,
            @RequestBody CandidateDTO request
    ) {
        return candidateService.updateCandidate(id, request)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }

    // ================= MAPPER =================
    private CandidateDTO toDTO(Candidate c) {
        CandidateDTO dto = new CandidateDTO();

        dto.setAccountId(c.getAccountId());
        dto.setEmail(c.getEmail());
        dto.setUserType(c.getUserType());
        dto.setAddress(c.getAddress());
        dto.setAvatarUrl(c.getAvatarUrl());

        dto.setFullName(c.getFullName());
        dto.setPhoneNumber(c.getPhoneNumber());
        dto.setAddress(c.getAddress());
        dto.setAvatarUrl(c.getAvatarUrl());
        dto.setJobSeekingStatus(c.getJobSeekingStatus());

        return dto;
    }
}