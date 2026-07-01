package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.enums.JobSeekingStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Candidate extends Account {

    private String fullName;
    private String phoneNumber;
    private String address;
    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private JobSeekingStatus jobSeekingStatus = JobSeekingStatus.SEEKING_JOB;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "candidate")
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "candidate")
    private List<Education> educations = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "candidate")
    private List<Project> projects = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "candidate")
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "candidate")
    private List<SupplementaryDocument> supplementaryDocuments = new ArrayList<>();

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public List<SupplementaryDocument> getSupplementaryDocuments() { return supplementaryDocuments; }
    public void setSupplementaryDocuments(List<SupplementaryDocument> supplementaryDocuments) {
        this.supplementaryDocuments = supplementaryDocuments;
    }

    public JobSeekingStatus getJobSeekingStatus() { return jobSeekingStatus; }
    public void setJobSeekingStatus(JobSeekingStatus jobSeekingStatus) {
        this.jobSeekingStatus = jobSeekingStatus;
    }

    public void updateTime() {
        this.setUpdatedAt(LocalDateTime.now());
    }
}