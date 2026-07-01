package com.recruitment.dto;

public class EmployerDTO extends AccountDTO {

    private String companyName;
    private int companySize;
    private String website;
    private String description;

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public int getCompanySize() { return companySize; }
    public void setCompanySize(int companySize) { this.companySize = companySize; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}