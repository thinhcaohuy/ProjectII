package com.recruitment.models;

import jakarta.persistence.*;

@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "project_id", length = 36)
    private String projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Candidate candidate;

    @Transient
    private String tempAccountId;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String technologies;

    private String demoLink;

    public Project() {}

    public Project(String projectName, String role, String technologies, String demoLink) {
        this.projectName = projectName;
        this.role = role;
        this.technologies = technologies;
        this.demoLink = demoLink;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
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

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTechnologies() {
        return technologies;
    }

    public void setTechnologies(String technologies) {
        this.technologies = technologies;
    }

    public String getDemoLink() {
        return demoLink;
    }

    public void setDemoLink(String demoLink) {
        this.demoLink = demoLink;
    }
}