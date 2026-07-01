package com.recruitment.dto;

import com.recruitment.enums.JobPostStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostDTO {

    private String jobPostId;

    private String title;

    private String industry;

    private String description;

    private String requiredSkills;

    private double salary;

    private String location;

    private LocalDateTime applicationDeadline;

    private JobPostStatus status;
}