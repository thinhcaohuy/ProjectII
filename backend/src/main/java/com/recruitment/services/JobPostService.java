package com.recruitment.services;

import com.recruitment.models.JobPost;
import com.recruitment.enums.JobPostStatus;
import com.recruitment.repositories.JobPostRepository;
import com.recruitment.repositories.EmployerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final EmployerRepository employerRepository;

    public JobPostService(JobPostRepository jobPostRepository,
                          EmployerRepository employerRepository) {
        this.jobPostRepository = jobPostRepository;
        this.employerRepository = employerRepository;
    }

    // ================= CREATE =================
    public Optional<JobPost> createJobPost(JobPost jobPost, String employerId) {

        if (jobPost == null || employerId == null || employerId.isBlank()) {
            return Optional.empty();
        }

        return employerRepository.findById(employerId)
                .map(employer -> {
                    jobPost.setEmployer(employer);
                    jobPost.setStatus(JobPostStatus.OPEN);
                    return jobPostRepository.save(jobPost);
                });
    }

    public Optional<JobPost> getJobPostById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return jobPostRepository.findById(id);
    }

    public List<JobPost> getAllJobPosts() {
        return jobPostRepository.findAll();
    }

    public List<JobPost> getByStatus(JobPostStatus status) {
        if (status == null) return List.of();
        return jobPostRepository.findByStatus(status);
    }

    public List<JobPost> getByEmployer(String employerId) {
        if (employerId == null || employerId.isBlank()) return List.of();
        return jobPostRepository.findByEmployer_AccountId(employerId);
    }

    public List<JobPost> searchByIndustry(String industry) {
        if (industry == null || industry.isBlank()) return List.of();
        return jobPostRepository.findByIndustryContainingIgnoreCase(industry);
    }

    public List<JobPost> searchByLocation(String location) {
        if (location == null || location.isBlank()) return List.of();
        return jobPostRepository.findByLocationContainingIgnoreCase(location);
    }

    public List<JobPost> searchBySalaryRange(double min, double max) {
        return jobPostRepository.findBySalaryBetween(min, max);
    }

    public List<JobPost> search(String keyword) {
        if (keyword == null || keyword.isBlank()) return List.of();

        return jobPostRepository
                .findByTitleContainingIgnoreCaseOrIndustryContainingIgnoreCase(keyword, keyword);
    }

    // ================= UPDATE =================
    public Optional<JobPost> updateJobPost(String id, JobPost update) {

        if (id == null || id.isBlank() || update == null) {
            return Optional.empty();
        }

        return jobPostRepository.findById(id)
                .map(job -> {
                    job.setTitle(update.getTitle());
                    job.setIndustry(update.getIndustry());
                    job.setDescription(update.getDescription());
                    job.setRequiredSkills(update.getRequiredSkills());
                    job.setSalary(update.getSalary());
                    job.setLocation(update.getLocation());
                    job.setApplicationDeadline(update.getApplicationDeadline());
                    return jobPostRepository.save(job);
                });
    }

    // ================= CLOSE =================
    public java.util.Optional<JobPost> closeJobPost(String id) {

        if (id == null || id.isBlank()) return java.util.Optional.empty();

        return jobPostRepository.findById(id)
                .map(job -> {
                    job.setStatus(JobPostStatus.CLOSED);
                    return jobPostRepository.save(job);
                });
    }

    // ================= DELETE =================
    public void deleteJobPost(String id) {
        if (id != null && !id.isBlank()) {
            jobPostRepository.deleteById(id);
        }
    }
}