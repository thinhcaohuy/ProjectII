package com.recruitment.services;

import com.recruitment.models.Report;
import com.recruitment.repositories.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // ================= CREATE =================
    public Report createReport(Report report) {
        if (report == null) return null;

        report.setGeneratedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    // ================= READ =================
    public Optional<Report> getReportById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return reportRepository.findById(id);
    }

    public List<Report> getAllReport() {
        return reportRepository.findAll();
    }

    public List<Report> getReportByEmployer(String employerId) {
        if (employerId == null || employerId.isBlank()) return List.of();
        return reportRepository.findByEmployer_AccountId(employerId);
    }

    // ================= UPDATE =================
    public Optional<Report> updateReport(String id, Report update) {

        if (id == null || id.isBlank() || update == null) {
            return Optional.empty();
        }

        return reportRepository.findById(id)
                .map(r -> {
                    r.setReportType(update.getReportType());
                    r.setFileFormat(update.getFileFormat());
                    r.setSummaryData(update.getSummaryData());
                    r.setEmployer(update.getEmployer());
                    return reportRepository.save(r);
                });
    }

    // ================= DELETE =================
    public void deleteReport(String id) {
        if (id != null && !id.isBlank()) {
            reportRepository.deleteById(id);
        }
    }
}