package com.recruitment.services;

import com.recruitment.dto.*;
import com.recruitment.enums.AccountStatus;
import com.recruitment.enums.LoginMessage;
import com.recruitment.enums.UserType;
import com.recruitment.models.Account;
import com.recruitment.models.Candidate;
import com.recruitment.models.Employer;
import com.recruitment.repositories.AccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AccountRepository accountRepository;

    public AuthService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    // ================= LOGIN =================
    public LoginResponse login(LoginRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            return error(LoginMessage.INVALID_REQUEST);
        }

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (account == null) {
            return error(LoginMessage.ACCOUNT_NOT_FOUND);
        }

        if (!account.getPassword().equals(request.getPassword())) {
            return error(LoginMessage.WRONG_PASSWORD);
        }

        return success(
                account.getAccountId(),
                account.getEmail(),
                account.getUserType()
        );
    }

    // ================= REGISTER EMPLOYER =================
    public LoginResponse registerEmployer(EmployerRegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return error(LoginMessage.INVALID_REQUEST);
        }

        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            return error(LoginMessage.EMAIL_ALREADY_EXISTS);
        }

        Employer employer = new Employer();
        employer.setEmail(request.getEmail());
        employer.setPassword(request.getPassword());
        employer.setUserType(UserType.EMPLOYER);
        employer.setStatus(AccountStatus.ACTIVE);

        employer.setCompanyName(request.getCompanyName());
        employer.setAddress(request.getAddress());
        employer.setCompanySize(request.getCompanySize() != null ? request.getCompanySize() : 0);
        employer.setWebsite(request.getWebsite());
        employer.setDescription(request.getDescription());

        Account saved = accountRepository.save(employer);

        return success(saved.getAccountId(), saved.getEmail(), saved.getUserType());
    }

    // ================= REGISTER CANDIDATE =================
    public LoginResponse registerCandidate(CandidateRegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return error(LoginMessage.INVALID_REQUEST);
        }

        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            return error(LoginMessage.EMAIL_ALREADY_EXISTS);
        }

        Candidate candidate = new Candidate();
        candidate.setEmail(request.getEmail());
        candidate.setPassword(request.getPassword());
        candidate.setUserType(UserType.CANDIDATE);
        candidate.setStatus(AccountStatus.ACTIVE);

        candidate.setFullName(request.getFullName());
        candidate.setPhoneNumber(request.getPhoneNumber());
        candidate.setAddress(request.getAddress());
        candidate.setAvatarUrl(request.getAvatarUrl());

        Account saved = accountRepository.save(candidate);

        return success(saved.getAccountId(), saved.getEmail(), saved.getUserType());
    }

    // ================= HELPERS =================

    private LoginResponse success(String id, String email, UserType type) {
        LoginResponse res = new LoginResponse();
        res.setId(id);
        res.setEmail(email);
        res.setUserType(type.name());
        res.setMessage(LoginMessage.SUCCESS.getMessage());
        return res;
    }

    private LoginResponse error(LoginMessage message) {
        LoginResponse res = new LoginResponse();
        res.setMessage(message.getMessage());
        return res;
    }
}