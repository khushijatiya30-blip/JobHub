package com.placement.controller;

import com.placement.dto.*;
import com.placement.model.Skill;
import com.placement.repository.SkillRepository;
import com.placement.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job Controller — list, post, apply for jobs
 */
@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final SkillRepository skillRepository;


    public JobController(JobService jobService,
            ApplicationService applicationService,
            SkillRepository skillRepository) {
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.skillRepository = skillRepository;
    }

    /** GET /api/jobs — all active jobs (public) */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse> listJobs(Authentication auth) {
        if (auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            var jobs = jobService.getJobsWithMatchScore(auth.getName());
            return ResponseEntity.ok(ApiResponse.success("Jobs fetched", jobs));
        }
        var jobs = jobService.getActiveJobs();
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched", jobs));
    }

    /** GET /api/jobs/{id} */
    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Job fetched", jobService.getJobById(id)));
    }

    /** GET /api/skills — skill master list */
    @GetMapping("/skills")
    public ResponseEntity<ApiResponse> getSkills(@RequestParam(required = false) String q) {
        List<Skill> skills = (q != null && !q.isEmpty())
                ? skillRepository.findByNameContainingIgnoreCase(q)
                : skillRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Skills", skills));
    }

    /** POST /api/company/post-job */
    @PostMapping("/company/post-job")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApiResponse> postJob(Authentication auth,
                                                @Valid @RequestBody JobPostRequest request) {
        var job = jobService.postJob(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Job posted successfully", job));
    }

    /** GET /api/company/jobs — company's own jobs */
    @GetMapping("/company/jobs")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApiResponse> companyJobs(Authentication auth) {
        var jobs = jobService.getJobsByCompany(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched", jobs));
    }

    /** PUT /api/company/jobs/{id}/close */
    @PutMapping("/company/jobs/{id}/close")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApiResponse> closeJob(@PathVariable Long id, Authentication auth) {
        var job = jobService.closeJob(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Job closed", job));
    }

    /** POST /api/apply — student applies for job */
    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> applyForJob(Authentication auth,
                                                    @RequestBody ApplyRequest request) {
        var app = applicationService.applyForJob(
                auth.getName(), request.getJobId(), request.getCoverLetter());
        return ResponseEntity.ok(ApiResponse.success("Application submitted", app));
    }

    /** GET /api/company/applicants/{jobId} */
    @GetMapping("/company/applicants/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApiResponse> getApplicants(@PathVariable Long jobId, Authentication auth) {
        var apps = applicationService.getJobApplicants(jobId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Applicants fetched", apps));
    }

    /** PUT /api/company/application/{appId}/status */
    @PutMapping("/company/application/{appId}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long appId,
                                                     @RequestParam String status,
                                                     @RequestParam(required = false) String feedback,
                                                     Authentication auth) {
        var app = applicationService.updateApplicationStatus(appId, status, feedback, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Status updated", app));
    }
}
