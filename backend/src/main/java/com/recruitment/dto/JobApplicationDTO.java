package com.recruitment.dto;

import com.recruitment.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {

    private String applicationId;

    private String coverLetter;

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    private ApplicationStatus status;

    private String candidateId;

    private String jobPostId;
}