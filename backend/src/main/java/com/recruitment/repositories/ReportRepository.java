package com.recruitment.repositories;

import com.recruitment.models.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByEmployer_AccountId(String employerId);

    List<Report> findByReportTypeContainingIgnoreCase(String reportType);

    List<Report> findByFileFormat(String fileFormat);

    // FIX: generatedAt (đúng entity)
    List<Report> findByGeneratedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Report> findAllByOrderByGeneratedAtDesc();

    List<Report> findByReportTypeContainingIgnoreCaseOrFileFormatContainingIgnoreCase(
            String reportType,
            String fileFormat
    );
}