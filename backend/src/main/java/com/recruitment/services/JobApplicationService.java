package com.recruitment.services;

import com.recruitment.models.Candidate;
import com.recruitment.models.JobApplication;
import com.recruitment.models.JobPost;
import com.recruitment.models.AssessmentAssignment;
import com.recruitment.models.Assessment;
import com.recruitment.models.ids.JobApplicationId;
import com.recruitment.models.ids.AssessmentAssignmentId;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.repositories.CandidateRepository;
import com.recruitment.repositories.JobApplicationRepository;
import com.recruitment.repositories.JobPostRepository;
import com.recruitment.repositories.AssessmentRepository;
import com.recruitment.repositories.AssessmentAssignmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobPostRepository jobPostRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAssignmentRepository assignmentRepository;

    public JobApplicationService(
            JobApplicationRepository jobApplicationRepository,
            CandidateRepository candidateRepository,
            JobPostRepository jobPostRepository,
            AssessmentRepository assessmentRepository,
            AssessmentAssignmentRepository assignmentRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobPostRepository = jobPostRepository;
        this.assessmentRepository = assessmentRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // ================= APPLY JOB =================
    public JobApplication submitApplication(
            String candidateId,
            String jobPostId,
            String coverLetter
    ) {
        if (candidateId == null || jobPostId == null) return null;

        Optional<Candidate> candidateOpt = candidateRepository.findById(candidateId);
        Optional<JobPost> jobPostOpt = jobPostRepository.findById(jobPostId);

        if (candidateOpt.isEmpty() || jobPostOpt.isEmpty()) {
            return null;
        }

        // prevent duplicate
        Optional<JobApplication> existing =
                jobApplicationRepository.findByCandidate_AccountIdAndJobPost_JobPostId(candidateId, jobPostId);

        if (existing.isPresent()) {
            return existing.get();
        }

        JobApplication app = new JobApplication();
        app.setCandidate(candidateOpt.get());
        app.setJobPost(jobPostOpt.get());
        app.setCoverLetter(coverLetter);
        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setAppliedAt(LocalDateTime.now());

        JobApplication savedApp = jobApplicationRepository.save(app);

        // Auto-assign assessments associated with the applied job post to the candidate
        try {
            String employerId = jobPostOpt.get().getEmployer().getAccountId();
            List<Assessment> employerAssessments = assessmentRepository.findByEmployer_AccountId(employerId);
            for (Assessment assessment : employerAssessments) {
                String rules = assessment.getRules();
                if (rules != null && rules.contains(jobPostId)) {
                    boolean exists = assignmentRepository
                        .findById(new AssessmentAssignmentId(assessment.getAssessmentId(), candidateId)).isPresent();
                    if (!exists) {
                        AssessmentAssignment assignment = new AssessmentAssignment();
                        assignment.setCandidate(candidateOpt.get());
                        assignment.setAssessment(assessment);
                        assignment.setStatus("Pending");
                        assignment.setAssignedAt(LocalDateTime.now());
                        assignmentRepository.save(assignment);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to auto-assign assessment on job application: " + e.getMessage());
        }

        return savedApp;
    }

    // ================= READ =================
    public Optional<JobApplication> getById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        if (id.contains("_")) {
            String[] parts = id.split("_");
            if (parts.length >= 2) {
                return jobApplicationRepository.findById(new JobApplicationId(parts[0], parts[1]));
            }
        }
        return Optional.empty();
    }

    public List<JobApplication> getByJobPost(String jobPostId) {
        if (jobPostId == null || jobPostId.isBlank()) return List.of();
        return jobApplicationRepository.findByJobPost_JobPostIdOrderByAppliedAtDesc(jobPostId);
    }

    public List<JobApplication> getByCandidate(String candidateId) {
        if (candidateId == null || candidateId.isBlank()) return List.of();
        return jobApplicationRepository.findByCandidate_AccountId(candidateId);
    }

    public List<JobApplication> getByStatus(ApplicationStatus status) {
        if (status == null) return List.of();
        return jobApplicationRepository.findByStatus(status);
    }

    // ================= UPDATE STATUS =================
    public Optional<JobApplication> updateStatus(String id, ApplicationStatus newStatus) {
        if (id == null || id.isBlank() || newStatus == null) {
            return Optional.empty();
        }

        return getById(id)
                .map(app -> {
                    app.setStatus(newStatus);
                    app.setUpdatedAt(LocalDateTime.now());
                    return jobApplicationRepository.save(app);
                });
    }

    // ================= DELETE =================
    public void deleteApplication(String id) {
        if (id != null && !id.isBlank() && id.contains("_")) {
            String[] parts = id.split("_");
            if (parts.length >= 2) {
                jobApplicationRepository.deleteById(new JobApplicationId(parts[0], parts[1]));
            }
        }
    }

    // ================= LATEST =================
    public List<JobApplication> getLatestApplications() {
        return jobApplicationRepository.findAllByOrderByAppliedAtDesc();
    }
}