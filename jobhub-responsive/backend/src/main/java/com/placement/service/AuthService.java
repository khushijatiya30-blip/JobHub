package com.placement.service;

import com.placement.config.JwtTokenProvider;
import com.placement.dto.*;
import com.placement.model.*;
import com.placement.repository.*;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service — register & login for all roles
 */
@Service

public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       CompanyRepository companyRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Authenticate user and return JWT token
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long profileId = null;
        String name = user.getEmail();

        if (user.getRole() == User.Role.STUDENT) {
            var student = studentRepository.findByUser(user).orElse(null);
            if (student != null) {
                profileId = student.getId();
                name = student.getName();
            }
        } else if (user.getRole() == User.Role.COMPANY) {
            var company = companyRepository.findByUser(user).orElse(null);
            if (company != null) {
                profileId = company.getId();
                name = company.getCompanyName();
            }
        } else {
            name = "Admin";
            profileId = user.getId();
        }

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileId(profileId)
                .name(name)
                .build();
    }

    /**
     * Register a new student
     */
    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.STUDENT)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .name(request.getName())
                .phone(request.getPhone())
                .branch(request.getBranch())
                .college(request.getCollege())
                .graduationYear(request.getGraduationYear())
                .cgpa(request.getCgpa())
                .placementStatus(Student.PlacementStatus.NOT_PLACED)
                .build();
        student = studentRepository.save(student);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role("STUDENT")
                .profileId(student.getId())
                .name(student.getName())
                .build();
    }

    /**
     * Register a new company (pending admin approval)
     */
    @Transactional
    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }
        if (companyRepository.existsByGstNumber(request.getGstNumber())) {
            throw new RuntimeException("GST Number already registered: " + request.getGstNumber());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.COMPANY)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .gstNumber(request.getGstNumber())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .approvalStatus(Company.ApprovalStatus.PENDING)
                .build();
        company.setCinNumber(request.getCinNumber());
        company.setCurrentAddress(request.getCurrentAddress());
        company.setDescription(request.getDescription());
        company = companyRepository.save(company);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role("COMPANY")
                .profileId(company.getId())
                .name(company.getCompanyName())
                .build();
    }
}
