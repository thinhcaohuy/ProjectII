package com.recruitment.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employer")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Employer extends Account {

    private String companyName;
    private String address;

    private int companySize;
    private String website;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public int getCompanySize() { return companySize; }
    public void setCompanySize(int companySize) { this.companySize = companySize; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public void updateTime() {
        this.setUpdatedAt(LocalDateTime.now());
    }
}