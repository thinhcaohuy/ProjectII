package com.recruitment.dto;

import com.recruitment.enums.JobSeekingStatus;

public class CandidateDTO extends AccountDTO {

    private String fullName;
    private String phoneNumber;
    private JobSeekingStatus jobSeekingStatus;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public JobSeekingStatus getJobSeekingStatus() { return jobSeekingStatus; }
    public void setJobSeekingStatus(JobSeekingStatus jobSeekingStatus) {
        this.jobSeekingStatus = jobSeekingStatus;
    }
}