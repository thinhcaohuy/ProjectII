package com.recruitment.models;

import jakarta.persistence.*;

@Entity
@Table(name = "experience")
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "experience_id", length = 36)
    private String experienceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Candidate candidate;

    @Transient
    private String tempAccountId;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String position;

    @Column(columnDefinition = "LONGTEXT")
    private String jobDescription;

    @Column(nullable = false)
    private String duration;

    public Experience() {}

    public Experience(String companyName, String position, String jobDescription, String duration) {
        this.companyName = companyName;
        this.position = position;
        this.jobDescription = jobDescription;
        this.duration = duration;
    }

    public String getExperienceId() {
        return experienceId;
    }

    public void setExperienceId(String experienceId) {
        this.experienceId = experienceId;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }
}