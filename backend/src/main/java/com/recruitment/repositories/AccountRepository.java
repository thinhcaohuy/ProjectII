package com.recruitment.repositories;

import com.recruitment.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    // login / lookup chung toàn hệ thống
    Optional<Account> findByEmail(String email);

    // kiểm tra email tồn tại (global uniqueness)
    boolean existsByEmail(String email);

    // lấy tất cả account (admin / analytics)
    List<Account> findAllByOrderByCreatedAtDesc();
}