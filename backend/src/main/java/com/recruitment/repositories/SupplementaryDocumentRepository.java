package com.recruitment.repositories;

import com.recruitment.models.SupplementaryDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplementaryDocumentRepository extends JpaRepository<SupplementaryDocument, String> {

    @Query("SELECT d FROM SupplementaryDocument d WHERE d.candidate.accountId = :accountId")
    List<SupplementaryDocument> findByAccountId(String accountId);
}
