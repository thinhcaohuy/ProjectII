package com.recruitment.models.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class JobApplicationId implements Serializable {

    @Column(name = "candidate_id", length = 36)
    private String candidateId;

    @Column(name = "job_post_id", length = 36)
    private String jobPostId;

    public JobApplicationId() {}

    public JobApplicationId(String candidateId, String jobPostId) {
        this.candidateId = candidateId;
        this.jobPostId = jobPostId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getJobPostId() {
        return jobPostId;
    }

    public void setJobPostId(String jobPostId) {
        this.jobPostId = jobPostId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobApplicationId that = (JobApplicationId) o;
        return Objects.equals(candidateId, that.candidateId) && Objects.equals(jobPostId, that.jobPostId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidateId, jobPostId);
    }
}
