package com.recruitment.controllers;

import com.recruitment.dto.SupplementaryDocumentDTO;
import com.recruitment.models.SupplementaryDocument;
import com.recruitment.services.SupplementaryDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supplementary-documents")
public class SupplementaryDocumentController {

    @Autowired
    private SupplementaryDocumentService supplementaryDocumentService;

    @PostMapping
    public ResponseEntity<SupplementaryDocumentDTO> createDocument(@RequestBody SupplementaryDocumentDTO docDTO) {
        SupplementaryDocument doc = new SupplementaryDocument();
        doc.setDriveLink(docDTO.getDriveLink());
        doc.setDescription(docDTO.getDescription());
        doc.setAccountId(docDTO.getAccountId());
        if (docDTO.getDocumentId() != null && !docDTO.getDocumentId().isBlank()) {
            doc.setDocumentId(docDTO.getDocumentId());
        }

        SupplementaryDocument saved = supplementaryDocumentService.save(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @GetMapping("/{accountId}/{documentId}")
    public ResponseEntity<SupplementaryDocumentDTO> getDocument(
            @PathVariable String accountId,
            @PathVariable String documentId) {
        SupplementaryDocument doc = supplementaryDocumentService.findById(documentId).orElse(null);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDTO(doc));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<SupplementaryDocumentDTO>> getDocumentsByAccount(@PathVariable String accountId) {
        List<SupplementaryDocument> docs = supplementaryDocumentService.findByAccountId(accountId);
        return ResponseEntity.ok(docs.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{accountId}/{documentId}")
    public ResponseEntity<SupplementaryDocumentDTO> updateDocument(
            @PathVariable String accountId,
            @PathVariable String documentId,
            @RequestBody SupplementaryDocumentDTO docDTO) {
        SupplementaryDocument doc = supplementaryDocumentService.findById(documentId).orElse(null);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        doc.setDriveLink(docDTO.getDriveLink());
        doc.setDescription(docDTO.getDescription());

        SupplementaryDocument updated = supplementaryDocumentService.save(doc);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{accountId}/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String accountId,
            @PathVariable String documentId) {
        supplementaryDocumentService.deleteById(documentId);
        return ResponseEntity.noContent().build();
    }

    private SupplementaryDocumentDTO toDTO(SupplementaryDocument doc) {
        SupplementaryDocumentDTO dto = new SupplementaryDocumentDTO();
        dto.setAccountId(doc.getAccountId());
        dto.setDocumentId(doc.getDocumentId());
        dto.setDriveLink(doc.getDriveLink());
        dto.setDescription(doc.getDescription());
        return dto;
    }
}
