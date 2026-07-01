package com.recruitment.models;

import jakarta.persistence.*;

@Entity
@Table(name = "education")
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "education_id", length = 36)
    private String educationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Candidate candidate;

    @Transient
    private String tempAccountId;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private String major;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private int graduationYear;

    public Education() {}

    public Education(String schoolName, String major, String degree, int graduationYear) {
        this.schoolName = schoolName;
        this.major = major;
        this.degree = degree;
        this.graduationYear = graduationYear;
    }

    public String getEducationId() {
        return educationId;
    }

    public void setEducationId(String educationId) {
        this.educationId = educationId;
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

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public int getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(int graduationYear) {
        this.graduationYear = graduationYear;
    }
}