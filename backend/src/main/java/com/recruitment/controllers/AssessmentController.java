package com.recruitment.controllers;

import com.recruitment.models.AssessmentAssignment;
import com.recruitment.services.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessment-assignments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    // ================= ASSIGN ASSESSMENT =================
    @PostMapping
    public ResponseEntity<AssessmentAssignment> assign(
            @RequestBody Map<String, String> payload
    ) {
        String candidateId = payload.get("candidateId");
        String assessmentId = payload.get("assessmentId");
        String jobPostId = payload.get("jobPostId");

        if (candidateId == null || assessmentId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            AssessmentAssignment assignment = assessmentService.assignAssessment(candidateId, assessmentId, jobPostId);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ================= GET BY CANDIDATE =================
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<AssessmentAssignment>> getByCandidate(@PathVariable String candidateId) {
        return ResponseEntity.ok(assessmentService.getAssignmentsByCandidate(candidateId));
    }

    // ================= GET BY EMPLOYER =================
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<AssessmentAssignment>> getByEmployer(@PathVariable String employerId) {
        return ResponseEntity.ok(assessmentService.getAssignmentsByEmployer(employerId));
    }

    // ================= START ASSIGNMENT =================
    @PostMapping("/{assignmentId}/start")
    public ResponseEntity<AssessmentAssignment> start(@PathVariable String assignmentId) {
        try {
            AssessmentAssignment assignment = assessmentService.startAssignment(assignmentId);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ================= SAVE DRAFT =================
    @PostMapping("/{assignmentId}/save-draft")
    public ResponseEntity<Void> saveDraft(
            @PathVariable String assignmentId,
            @RequestBody Map<String, Integer> answers
    ) {
        try {
            assessmentService.saveDraftAnswers(assignmentId, answers);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ================= SUBMIT ASSIGNMENT =================
    public static class SubmissionRequest {
        public Map<String, Integer> answers;
        public int durationMinutes;
    }

    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<AssessmentAssignment> submit(
            @PathVariable String assignmentId,
            @RequestBody SubmissionRequest request
    ) {
        try {
            AssessmentAssignment assignment = assessmentService.submitAssignment(
                    assignmentId, 
                    request.answers, 
                    request.durationMinutes
            );
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ================= GET CANDIDATE ANSWERS FOR REVIEW =================
    @GetMapping("/{assignmentId}/answers")
    public ResponseEntity<List<Map<String, Object>>> getAnswers(@PathVariable String assignmentId) {
        return ResponseEntity.ok(assessmentService.getAttemptAnswers(assignmentId));
    }
}
