package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.SupplementaryDocument;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.SupplementaryDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class SupplementaryDocumentService {

    private final SupplementaryDocumentRepository supplementaryDocumentRepository;
    private final CandidateRepository candidateRepository;

    public SupplementaryDocumentService(
            SupplementaryDocumentRepository supplementaryDocumentRepository,
            CandidateRepository candidateRepository) {
        this.supplementaryDocumentRepository = supplementaryDocumentRepository;
        this.candidateRepository = candidateRepository;
    }

    public SupplementaryDocument save(SupplementaryDocument doc) {
        if (doc == null) return null;

        if (doc.getCandidate() == null) {
            String accountId = doc.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "accountId is required");
            }

            Candidate candidate = candidateRepository.findById(accountId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Candidate not found"));
            doc.setCandidate(candidate);
        }

        return supplementaryDocumentRepository.save(doc);
    }

    public Optional<SupplementaryDocument> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return supplementaryDocumentRepository.findById(id);
    }

    public List<SupplementaryDocument> findByAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) return List.of();
        return supplementaryDocumentRepository.findByAccountId(accountId);
    }

    public List<SupplementaryDocument> getAllDocuments() {
        return supplementaryDocumentRepository.findAll();
    }

    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            supplementaryDocumentRepository.deleteById(id);
        }
    }
}
