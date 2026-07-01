package com.recruitment.models;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String reportId;

    @Column(nullable = false)
    private String reportType;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private String fileFormat;

    @Column(columnDefinition = "LONGTEXT")
    private String summaryData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    public Report() {}

    public Report(String reportType, LocalDateTime generatedAt, String fileFormat, String summaryData) {
        this.reportType = reportType;
        this.generatedAt = generatedAt;
        this.fileFormat = fileFormat;
        this.summaryData = summaryData;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public String getSummaryData() {
        return summaryData;
    }

    public void setSummaryData(String summaryData) {
        this.summaryData = summaryData;
    }

    public Employer getEmployer() {
        return employer;
    }

    public void setEmployer(Employer employer) {
        this.employer = employer;
    }
}