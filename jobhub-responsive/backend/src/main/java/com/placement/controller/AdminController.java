package com.placement.controller;

import com.placement.dto.*;
import com.placement.model.*;
import com.placement.repository.*;
import com.placement.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Controller — manage platform, approve companies, view reports
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StudentService studentService;
    private final CompanyService companyService;
    private final ApplicationService applicationService;
    private final JobRepository jobRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;


    public AdminController(StudentService studentService,
            CompanyService companyService,
            ApplicationService applicationService,
            JobRepository jobRepository,
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            ApplicationRepository applicationRepository) {
        this.studentService = studentService;
        this.companyService = companyService;
        this.applicationService = applicationService;
        this.jobRepository = jobRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.applicationRepository = applicationRepository;
    }

    /** GET /api/admin/dashboard — dashboard stats */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard() {
        DashboardStats stats = DashboardStats.builder()
                .totalStudents(studentRepository.count())
                .placedStudents(studentRepository.countByPlacementStatus(
                        Student.PlacementStatus.PLACED))
                .totalCompanies(companyRepository.count())
                .approvedCompanies(companyRepository
                        .findByApprovalStatus(Company.ApprovalStatus.APPROVED).size())
                .totalJobs(jobRepository.count())
                .activeJobs(jobRepository.countByStatus(Job.JobStatus.ACTIVE))
                .totalApplications(applicationRepository.count())
                .selectedApplications(applicationRepository.countByStatus(
                        Application.ApplicationStatus.SELECTED))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }

    /** GET /api/admin/students */
    @GetMapping("/students")
    public ResponseEntity<ApiResponse> getAllStudents() {
        return ResponseEntity.ok(
                ApiResponse.success("Students", studentService.getAllStudents()));
    }

    /** GET /api/admin/companies */
    @GetMapping("/companies")
    public ResponseEntity<ApiResponse> getAllCompanies() {
        return ResponseEntity.ok(
                ApiResponse.success("Companies", companyService.getAllCompanies()));
    }

    /** GET /api/admin/companies/pending */
    @GetMapping("/companies/pending")
    public ResponseEntity<ApiResponse> getPendingCompanies() {
        return ResponseEntity.ok(
                ApiResponse.success("Pending companies", companyService.getPendingCompanies()));
    }

    /** PUT /api/admin/approve-company/{id} */
    @PutMapping("/approve-company/{id}")
    public ResponseEntity<ApiResponse> approveCompany(@PathVariable Long id) {
        Company company = companyService.approveCompany(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Company approved: " + company.getCompanyName(), company));
    }

    /** PUT /api/admin/reject-company/{id} */
    @PutMapping("/reject-company/{id}")
    public ResponseEntity<ApiResponse> rejectCompany(@PathVariable Long id,
                                                      @RequestParam String reason) {
        Company company = companyService.rejectCompany(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Company rejected", company));
    }

    /** GET /api/admin/applications */
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse> getAllApplications() {
        return ResponseEntity.ok(
                ApiResponse.success("Applications", applicationService.getAllApplications()));
    }

    /** GET /api/admin/reports */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse> getReports() {
        var report = Map.of(
                "totalStudents",     studentRepository.count(),
                "placedStudents",    studentRepository.countByPlacementStatus(Student.PlacementStatus.PLACED),
                "totalCompanies",    companyRepository.count(),
                "approvedCompanies", companyRepository.findByApprovalStatus(Company.ApprovalStatus.APPROVED).size(),
                "totalJobs",         jobRepository.count(),
                "totalApplications", applicationRepository.count()
        );
        return ResponseEntity.ok(ApiResponse.success("Report", report));
    }
}
