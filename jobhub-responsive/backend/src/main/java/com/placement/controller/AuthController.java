package com.placement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placement.dto.ApiResponse;
import com.placement.dto.AuthResponse;
import com.placement.dto.CompanyRegisterRequest;
import com.placement.dto.LoginRequest;
import com.placement.dto.StudentRegisterRequest;
import com.placement.service.AuthService;

import jakarta.validation.Valid;

/**
 * Auth Controller — register & login endpoints (public)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;


    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/login — login for all roles */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /** POST /api/auth/register/student */
    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return ResponseEntity.ok(ApiResponse.success("Student registered successfully", response));
    }

    /** POST /api/auth/register/company */
    @PostMapping("/register/company")
    public ResponseEntity<ApiResponse> registerCompany(
            @Valid @RequestBody CompanyRegisterRequest request) {
        AuthResponse response = authService.registerCompany(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Company registered. Waiting for admin approval.", response));
    }
}
