package com.recruitment.controllers;

import com.recruitment.dto.SkillDTO;
import com.recruitment.models.Skill;
import com.recruitment.services.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skill")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @PostMapping
    public ResponseEntity<SkillDTO> createSkill(@RequestBody SkillDTO skillDTO) {
        Skill skill = new Skill();
        skill.setSkillName(skillDTO.getSkillName());
        skill.setProficiencyLevel(skillDTO.getProficiencyLevel());
        skill.setAccountId(skillDTO.getAccountId());
        if (skillDTO.getSkillId() != null && !skillDTO.getSkillId().isBlank()) {
            skill.setSkillId(skillDTO.getSkillId());
        }

        Skill savedSkill = skillService.save(skill);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedSkill));
    }

    @GetMapping("/{accountId}/{skillId}")
    public ResponseEntity<SkillDTO> getSkill(
            @PathVariable String accountId,
            @PathVariable String skillId) {
        Skill skill = skillService.findById(skillId).orElse(null);
        if (skill == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDTO(skill));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<SkillDTO>> getSkillsByAccount(@PathVariable String accountId) {
        List<Skill> skills = skillService.findByAccountId(accountId);
        return ResponseEntity.ok(skills.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{accountId}/{skillId}")
    public ResponseEntity<SkillDTO> updateSkill(
            @PathVariable String accountId,
            @PathVariable String skillId,
            @RequestBody SkillDTO skillDTO) {
        Skill skill = skillService.findById(skillId).orElse(null);
        if (skill == null) {
            return ResponseEntity.notFound().build();
        }

        skill.setSkillName(skillDTO.getSkillName());
        skill.setProficiencyLevel(skillDTO.getProficiencyLevel());

        Skill updatedSkill = skillService.save(skill);
        return ResponseEntity.ok(toDTO(updatedSkill));
    }

    @DeleteMapping("/{accountId}/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable String accountId,
            @PathVariable String skillId) {
        skillService.deleteById(skillId);
        return ResponseEntity.noContent().build();
    }

    private SkillDTO toDTO(Skill skill) {
        SkillDTO dto = new SkillDTO();
        dto.setAccountId(skill.getAccountId());
        dto.setSkillId(skill.getSkillId());
        dto.setSkillName(skill.getSkillName());
        dto.setProficiencyLevel(skill.getProficiencyLevel());
        return dto;
    }
}
