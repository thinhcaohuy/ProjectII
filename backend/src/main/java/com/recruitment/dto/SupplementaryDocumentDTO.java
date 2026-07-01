package com.recruitment.dto;

public class SupplementaryDocumentDTO {

    private String documentId;
    private String accountId;
    private String driveLink;
    private String description;

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
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
