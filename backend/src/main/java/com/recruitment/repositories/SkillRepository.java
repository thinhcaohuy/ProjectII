package com.recruitment.repositories;

import com.recruitment.models.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {

    @Query("SELECT s FROM Skill s WHERE s.candidate.accountId = :accountId")
    List<Skill> findByAccountId(String accountId);

    List<Skill> findBySkillNameContainingIgnoreCase(String skillName);

    List<Skill> findByProficiencyLevel(int proficiencyLevel);

    List<Skill> findByProficiencyLevelGreaterThanEqual(int level);

    List<Skill> findBySkillNameContainingIgnoreCaseOrProficiencyLevel(
            String skillName,
            int proficiencyLevel
    );
}