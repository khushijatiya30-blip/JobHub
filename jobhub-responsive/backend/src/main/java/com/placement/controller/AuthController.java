package com.placement.controller;

import com.placement.dto.*;
import com.placement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
