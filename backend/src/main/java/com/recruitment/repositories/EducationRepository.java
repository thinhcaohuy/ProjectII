package com.recruitment.repositories;

import com.recruitment.models.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, String> {

    @Query("SELECT e FROM Education e WHERE e.candidate.accountId = :accountId")
    List<Education> findByAccountId(String accountId);

    List<Education> findBySchoolNameContainingIgnoreCase(String schoolName);

    List<Education> findByMajorContainingIgnoreCase(String major);

    List<Education> findByDegreeContainingIgnoreCase(String degree);

    List<Education> findByGraduationYear(int graduationYear);

    List<Education> findByGraduationYearBetween(int startYear, int endYear);

    List<Education> findBySchoolNameContainingIgnoreCaseOrMajorContainingIgnoreCase(
            String schoolName,
            String major
    );
}