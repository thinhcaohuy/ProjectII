package com.recruitment.repositories;

import com.recruitment.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    @Query("SELECT p FROM Project p WHERE p.candidate.accountId = :accountId")
    List<Project> findByAccountId(String accountId);

    List<Project> findByProjectNameContainingIgnoreCase(String projectName);

    List<Project> findByRoleContainingIgnoreCase(String role);

    List<Project> findByTechnologiesContainingIgnoreCase(String technologies);

    List<Project> findByDemoLink(String demoLink);

    List<Project> findByProjectNameContainingIgnoreCaseOrRoleContainingIgnoreCase(
            String projectName,
            String role
    );
}