package com.recruitment.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.models.*;
import com.recruitment.models.ids.*;
import com.recruitment.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentOptionRepository optionRepository;
    private final AssessmentAssignmentRepository assignmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final CandidateAnswerRepository candidateAnswerRepository;
    
    private final CandidateRepository candidateRepository;
    private final JobPostRepository jobPostRepository;
    private final EmployerRepository employerRepository;
    private final JobApplicationRepository jobApplicationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository questionRepository,
            AssessmentOptionRepository optionRepository,
            AssessmentAssignmentRepository assignmentRepository,
            AssessmentAttemptRepository attemptRepository,
            CandidateAnswerRepository candidateAnswerRepository,
            CandidateRepository candidateRepository,
            JobPostRepository jobPostRepository,
            EmployerRepository employerRepository,
            JobApplicationRepository jobApplicationRepository) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.assignmentRepository = assignmentRepository;
        this.attemptRepository = attemptRepository;
        this.candidateAnswerRepository = candidateAnswerRepository;
        this.candidateRepository = candidateRepository;
        this.jobPostRepository = jobPostRepository;
        this.employerRepository = employerRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    // ================= ASSESSMENT CRUD =================

    public Assessment saveAssessmentFromPayload(String assessmentId, String title, int durationMinutes, double passingScore, String rulesJson, String employerId) {
        Assessment assessment = null;
        if (assessmentId != null && !assessmentId.isBlank()) {
            assessment = assessmentRepository.findById(assessmentId).orElse(null);
        }
        if (assessment == null) {
            assessment = new Assessment();
            assessment.setAssessmentId(assessmentId != null && !assessmentId.isBlank() ? assessmentId : java.util.UUID.randomUUID().toString());
            assessment.setCreatedAt(LocalDateTime.now());
        }
        
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new IllegalArgumentException("Employer not found"));
        
        assessment.setEmployer(employer);
        assessment.setTitle(title);
        assessment.setDurationMinutes(durationMinutes);
        assessment.setPassingScore(passingScore);
        assessment.setUpdatedAt(LocalDateTime.now());
        assessment.setRules(rulesJson);

        // Parse rules JSON
        List<Map<String, Object>> questionsList = new ArrayList<>();
        String status = "Published";
        List<String> assignedJobIds = new ArrayList<>();

        if (rulesJson != null && !rulesJson.isBlank()) {
            try {
                Map<String, Object> meta = objectMapper.readValue(rulesJson, new TypeReference<Map<String, Object>>() {});
                if (meta.containsKey("status")) {
                    status = (String) meta.get("status");
                }
                if (meta.containsKey("assignedJobIds")) {
                    assignedJobIds = (List<String>) meta.get("assignedJobIds");
                }
                if (meta.containsKey("questions")) {
                    questionsList = (List<Map<String, Object>>) meta.get("questions");
                }
            } catch (Exception e) {
                System.err.println("Failed to parse assessment rules JSON: " + e.getMessage());
            }
        }
        assessment.setStatus(status);
        assessment = assessmentRepository.save(assessment);

        // Clear existing questions
        List<AssessmentQuestion> existingQuestions = questionRepository.findByAssessment_AssessmentId(assessment.getAssessmentId());
        questionRepository.deleteAll(existingQuestions);

        if (questionsList != null) {
            for (int i = 0; i < questionsList.size(); i++) {
                Map<String, Object> qMap = questionsList.get(i);
                AssessmentQuestion question = new AssessmentQuestion();
                question.setAssessment(assessment);
                question.setQuestionText((String) qMap.get("questionText"));
                
                Object correctIndexObj = qMap.get("correctOptionIndex");
                int correctIndex = 0;
                if (correctIndexObj instanceof Number) {
                    correctIndex = ((Number) correctIndexObj).intValue();
                } else if (correctIndexObj instanceof String) {
                    try {
                        correctIndex = Integer.parseInt((String) correctIndexObj);
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }
                question.setCorrectOptionIndex(correctIndex);
                
                question.setOrderIndex(i);
                question.setScoreWeight(1.0);
                question = questionRepository.save(question);

                List<String> options = (List<String>) qMap.get("options");
                if (options != null) {
                    for (int j = 0; j < options.size(); j++) {
                        AssessmentOption option = new AssessmentOption();
                        option.setQuestion(question);
                        option.setOptionText(options.get(j));
                        option.setOptionIndex(j);
                        optionRepository.save(option);
                    }
                }
            }
        }

        // Auto-assign to candidates who already applied
        for (String jobId : assignedJobIds) {
            try {
                List<JobApplication> applications = jobApplicationRepository.findByJobPost_JobPostId(jobId);
                for (JobApplication app : applications) {
                    if (app.getCandidate() != null) {
                        assignAssessment(app.getCandidate().getAccountId(), assessment.getAssessmentId(), jobId);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to auto-assign: " + e.getMessage());
            }
        }
        
        return assessment;
    }

    public List<Assessment> getAssessmentsByEmployer(String employerId) {
        return assessmentRepository.findByEmployer_AccountId(employerId);
    }
    
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }
    
    public Assessment getAssessmentById(String id) {
        return assessmentRepository.findById(id).orElse(null);
    }
    
    public void deleteAssessment(String id) {
        assessmentRepository.findById(id).ifPresent(assessmentRepository::delete);
    }

    // ================= ASSIGNMENT WORKFLOW =================

    public AssessmentAssignment assignAssessment(String candidateId, String assessmentId, String jobPostId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found"));

        // Check for existing assignment
        Optional<AssessmentAssignment> existing = assignmentRepository
                .findById(new AssessmentAssignmentId(assessmentId, candidateId));
        if (existing.isPresent()) {
            return existing.get();
        }

        AssessmentAssignment assignment = new AssessmentAssignment();
        assignment.setCandidate(candidate);
        assignment.setAssessment(assessment);
        assignment.setStatus("Pending");
        assignment.setAssignedAt(LocalDateTime.now());

        return assignmentRepository.save(assignment);
    }

    public List<AssessmentAssignment> getAssignmentsByCandidate(String candidateId) {
        return assignmentRepository.findByCandidate_AccountId(candidateId);
    }

    public List<AssessmentAssignment> getAssignmentsByEmployer(String employerId) {
        return assignmentRepository.findByAssessment_Employer_AccountId(employerId);
    }

    public AssessmentAssignment startAssignment(String assignmentId) {
        String assessmentId = null;
        String candidateId = null;
        if (assignmentId != null && assignmentId.contains("_")) {
            String[] parts = assignmentId.split("_");
            assessmentId = parts[0];
            candidateId = parts[1];
        } else {
            throw new IllegalArgumentException("Invalid assignment ID format");
        }

        AssessmentAssignmentId id = new AssessmentAssignmentId(assessmentId, candidateId);
        AssessmentAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if ("Pending".equals(assignment.getStatus())) {
            assignment.setStatus("Started");
            assignment.setStartedAt(LocalDateTime.now());
            assignment = assignmentRepository.save(assignment);

            // Create assessment attempt
            AssessmentAttempt attempt = new AssessmentAttempt();
            String attemptId = java.util.UUID.randomUUID().toString();
            attempt.setAttemptId(attemptId);
            attempt.setAssignment(assignment);
            attempt.setAttemptNumber(assignment.getAttempts().size() + 1);
            attempt.setStatus("STARTED");
            attemptRepository.save(attempt);
        }

        return assignment;
    }

    public void saveDraftAnswers(String assignmentId, Map<String, Integer> answers) {
        String assessmentId = null;
        String candidateId = null;
        if (assignmentId != null && assignmentId.contains("_")) {
            String[] parts = assignmentId.split("_");
            assessmentId = parts[0];
            candidateId = parts[1];
        } else {
            throw new IllegalArgumentException("Invalid assignment ID format");
        }

        AssessmentAssignmentId assignmentIdObj = new AssessmentAssignmentId(assessmentId, candidateId);
        AssessmentAssignment assignment = assignmentRepository.findById(assignmentIdObj)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        final String finalAssessmentId = assessmentId;
        final String finalCandidateId = candidateId;
        AssessmentAttempt attempt = attemptRepository.findById_AssessmentIdAndId_CandidateId(assessmentId, candidateId).stream()
                .filter(att -> "STARTED".equals(att.getStatus()))
                .findFirst()
                .orElseGet(() -> {
                    AssessmentAttempt newAttempt = new AssessmentAttempt();
                    String attemptId = java.util.UUID.randomUUID().toString();
                    newAttempt.setAttemptId(attemptId);
                    newAttempt.setAssignment(assignment);
                    newAttempt.setAttemptNumber(assignment.getAttempts().size() + 1);
                    newAttempt.setStatus("STARTED");
                    return attemptRepository.save(newAttempt);
                });

        List<AssessmentQuestion> questions = questionRepository.findByAssessment_AssessmentId(assignment.getAssessment().getAssessmentId());

        for (Map.Entry<String, Integer> entry : answers.entrySet()) {
            String key = entry.getKey();
            Integer selectedIndex = entry.getValue();

            AssessmentQuestion question = null;
            try {
                int orderIndex = Integer.parseInt(key);
                question = questions.stream()
                        .filter(q -> q.getOrderIndex() == orderIndex)
                        .findFirst()
                        .orElse(null);
            } catch (NumberFormatException e) {
                question = questions.stream()
                        .filter(q -> q.getQuestionId().equals(key))
                        .findFirst()
                        .orElse(null);
            }

            if (question != null && selectedIndex != null) {
                final String qId = question.getQuestionId();
                CandidateAnswer candidateAnswer = attempt.getAnswers().stream()
                        .filter(ans -> ans.getQuestion().getQuestionId().equals(qId))
                        .findFirst()
                        .orElse(null);

                if (candidateAnswer == null) {
                    candidateAnswer = new CandidateAnswer();
                    candidateAnswer.setAttempt(attempt);
                    candidateAnswer.setQuestion(question);
                    attempt.getAnswers().add(candidateAnswer);
                }

                candidateAnswer.setSelectedOptionIndex(selectedIndex);
                candidateAnswerRepository.save(candidateAnswer);
            }
        }
    }

    public AssessmentAssignment submitAssignment(String assignmentId, Map<String, Integer> answers, int durationMinutes) {
        String assessmentId = null;
        String candidateId = null;
        if (assignmentId != null && assignmentId.contains("_")) {
            String[] parts = assignmentId.split("_");
            assessmentId = parts[0];
            candidateId = parts[1];
        } else {
            throw new IllegalArgumentException("Invalid assignment ID format");
        }

        AssessmentAssignmentId assignmentIdObj = new AssessmentAssignmentId(assessmentId, candidateId);
        AssessmentAssignment assignment = assignmentRepository.findById(assignmentIdObj)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        // Save answers as draft first
        saveDraftAnswers(assignmentId, answers);

        AssessmentAttempt attempt = attemptRepository.findById_AssessmentIdAndId_CandidateId(assessmentId, candidateId).stream()
                .filter(att -> "STARTED".equals(att.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active attempt found to submit"));

        // Calculate score
        List<AssessmentQuestion> questions = questionRepository.findByAssessment_AssessmentId(assignment.getAssessment().getAssessmentId());
        int correctCount = 0;
        List<CandidateAnswer> savedAnswers = attempt.getAnswers();

        for (AssessmentQuestion q : questions) {
            Optional<CandidateAnswer> ansOpt = savedAnswers.stream()
                    .filter(ans -> ans.getQuestion().getQuestionId().equals(q.getQuestionId()))
                    .findFirst();

            if (ansOpt.isPresent() && ansOpt.get().getSelectedOptionIndex() == q.getCorrectOptionIndex()) {
                correctCount++;
            }
        }

        double score = questions.isEmpty() ? 0.0 : ((double) correctCount / questions.size()) * 100.0;
        score = Math.round(score * 10.0) / 10.0; // Round to 1 decimal place

        // Update Attempt
        attempt.setStatus("SUBMITTED");
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setScore(score);
        attemptRepository.save(attempt);

        // Update Assignment
        assignment.setStatus("Submitted");
        assignment.setCompletedAt(LocalDateTime.now());
        assignment.setScore(score);
        assignment.setFeedback("Auto-graded scorecard. Passing threshold: " + assignment.getAssessment().getPassingScore() + "%");
        
        return assignmentRepository.save(assignment);
    }

    public List<Map<String, Object>> getAttemptAnswers(String assignmentId) {
        String assessmentId = null;
        String candidateId = null;
        if (assignmentId != null && assignmentId.contains("_")) {
            String[] parts = assignmentId.split("_");
            assessmentId = parts[0];
            candidateId = parts[1];
        } else {
            throw new IllegalArgumentException("Invalid assignment ID format");
        }

        List<AssessmentAttempt> attempts = attemptRepository.findById_AssessmentIdAndId_CandidateId(assessmentId, candidateId);
        if (attempts.isEmpty()) return List.of();

        // Get latest attempt
        AssessmentAttempt attempt = attempts.get(attempts.size() - 1);
        List<CandidateAnswer> answers = attempt.getAnswers();

        List<Map<String, Object>> result = new ArrayList<>();
        for (CandidateAnswer ans : answers) {
            Map<String, Object> map = new HashMap<>();
            map.put("questionId", ans.getQuestion().getQuestionId());
            map.put("orderIndex", ans.getQuestion().getOrderIndex());
            map.put("selectedOptionIndex", ans.getSelectedOptionIndex());
            map.put("correctOptionIndex", ans.getQuestion().getCorrectOptionIndex());
            result.add(map);
        }
        return result;
    }
}
