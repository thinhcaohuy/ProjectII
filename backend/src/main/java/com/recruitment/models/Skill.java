package com.recruitment.models;

import jakarta.persistence.*;

@Entity
@Table(name = "skill")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "skill_id", length = 36)
    private String skillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Candidate candidate;

    @Transient
    private String tempAccountId;

    @Column(nullable = false)
    private String skillName;

    @Column(nullable = false)
    private int proficiencyLevel;

    public Skill() {}

    public Skill(String skillName, int proficiencyLevel) {
        this.skillName = skillName;
        this.proficiencyLevel = proficiencyLevel;
    }

    public String getSkillId() {
        return skillId;
    }

    public void setSkillId(String skillId) {
        this.skillId = skillId;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public String getAccountId() {
        return candidate != null ? candidate.getAccountId() : tempAccountId;
    }

    public void setAccountId(String accountId) {
        this.tempAccountId = accountId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public int getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(int proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
}