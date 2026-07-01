package com.recruitment.controllers;

import com.recruitment.dto.*;
import com.recruitment.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ================= REGISTER EMPLOYER =================
    @PostMapping("/register/employer")
    public ResponseEntity<LoginResponse> registerEmployer(@RequestBody EmployerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerEmployer(request));
    }

    // ================= REGISTER CANDIDATE =================
    @PostMapping("/register/candidate")
    public ResponseEntity<LoginResponse> registerCandidate(@RequestBody CandidateRegisterRequest request) {
        return ResponseEntity.ok(authService.registerCandidate(request));
    }
}