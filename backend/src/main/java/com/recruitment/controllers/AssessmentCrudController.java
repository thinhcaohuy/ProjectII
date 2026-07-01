package com.recruitment.controllers;

import com.recruitment.models.Assessment;
import com.recruitment.services.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
public class AssessmentCrudController {

    private final AssessmentService assessmentService;

    public AssessmentCrudController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    public static class AssessmentPayload {
        public String examName;
        public int durationMinutes;
        public double passingScore;
        public String rules;
        public Map<String, String> employer;
    }

    @PostMapping
    public ResponseEntity<Assessment> create(@RequestBody AssessmentPayload payload) {
        if (payload.employer == null || !payload.employer.containsKey("accountId")) {
            return ResponseEntity.badRequest().build();
        }
        Assessment assessment = assessmentService.saveAssessmentFromPayload(
                null,
                payload.examName,
                payload.durationMinutes,
                payload.passingScore,
                payload.rules,
                payload.employer.get("accountId")
        );
        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assessment> update(
            @PathVariable String id,
            @RequestBody AssessmentPayload payload
    ) {
        if (payload.employer == null || !payload.employer.containsKey("accountId")) {
            return ResponseEntity.badRequest().build();
        }
        Assessment assessment = assessmentService.saveAssessmentFromPayload(
                id,
                payload.examName,
                payload.durationMinutes,
                payload.passingScore,
                payload.rules,
                payload.employer.get("accountId")
        );
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getById(@PathVariable String id) {
        Assessment assessment = assessmentService.getAssessmentById(id);
        if (assessment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(assessment);
    }

    @GetMapping
    public ResponseEntity<List<Assessment>> getAll() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Assessment>> getByEmployer(@PathVariable String employerId) {
        return ResponseEntity.ok(assessmentService.getAssessmentsByEmployer(employerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }
}
