package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "supplementary_document")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SupplementaryDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id", length = 36)
    private String documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @Transient
    private String tempAccountId;

    @Column(name = "drive_link", nullable = false)
    private String driveLink;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    public SupplementaryDocument() {}

    public SupplementaryDocument(Candidate candidate, String driveLink, String description) {
        this.candidate = candidate;
        this.driveLink = driveLink;
        this.description = description;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public String getAccountId() {
        return candidate != null ? candidate.getAccountId() : tempAccountId;
    }

    public void setAccountId(String accountId) {
        this.tempAccountId = accountId;
    }

    public String getDriveLink() {
        return driveLink;
    }

    public void setDriveLink(String driveLink) {
        this.driveLink = driveLink;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
