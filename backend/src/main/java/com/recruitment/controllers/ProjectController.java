package com.recruitment.controllers;

import com.recruitment.dto.ProjectDTO;
import com.recruitment.models.Project;
import com.recruitment.services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO projectDTO) {
        Project project = new Project();
        project.setProjectName(projectDTO.getProjectName());
        project.setRole(projectDTO.getRole());
        project.setTechnologies(projectDTO.getTechnologies());
        project.setDemoLink(projectDTO.getDemoLink());
        project.setAccountId(projectDTO.getAccountId());
        if (projectDTO.getProjectId() != null && !projectDTO.getProjectId().isBlank()) {
            project.setProjectId(projectDTO.getProjectId());
        }

        Project savedProject = projectService.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedProject));
    }

    @GetMapping("/{accountId}/{projectId}")
    public ResponseEntity<ProjectDTO> getProject(
            @PathVariable String accountId,
            @PathVariable String projectId) {
        Project project = projectService.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDTO(project));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByAccount(@PathVariable String accountId) {
        List<Project> projects = projectService.findByAccountId(accountId);
        return ResponseEntity.ok(projects.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{accountId}/{projectId}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable String accountId,
            @PathVariable String projectId,
            @RequestBody ProjectDTO projectDTO) {
        Project project = projectService.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        project.setProjectName(projectDTO.getProjectName());
        project.setRole(projectDTO.getRole());
        project.setTechnologies(projectDTO.getTechnologies());
        project.setDemoLink(projectDTO.getDemoLink());

        Project updatedProject = projectService.save(project);
        return ResponseEntity.ok(toDTO(updatedProject));
    }

    @DeleteMapping("/{accountId}/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String accountId,
            @PathVariable String projectId) {
        projectService.deleteById(projectId);
        return ResponseEntity.noContent().build();
    }

    private ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setAccountId(project.getAccountId());
        dto.setProjectId(project.getProjectId());
        dto.setProjectName(project.getProjectName());
        dto.setRole(project.getRole());
        dto.setTechnologies(project.getTechnologies());
        dto.setDemoLink(project.getDemoLink());
        return dto;
    }
}
