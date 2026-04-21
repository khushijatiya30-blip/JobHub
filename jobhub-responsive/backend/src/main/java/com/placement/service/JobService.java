package com.placement.service;

import com.placement.dto.JobPostRequest;
import com.placement.model.*;
import com.placement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Job Service — post, list, match jobs
 */
@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;
    private final StudentRepository studentRepository;
    private final MatchingService matchingService;
    private final UserRepository userRepository;


    public JobService(JobRepository jobRepository,
                       CompanyRepository companyRepository,
                       SkillRepository skillRepository,
                       StudentRepository studentRepository,
                       MatchingService matchingService,
                       UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.skillRepository = skillRepository;
        this.studentRepository = studentRepository;
        this.matchingService = matchingService;
        this.userRepository = userRepository;
    }

    /**
     * Post a new job (by company)
     */
    @Transactional
    public Job postJob(String companyEmail, JobPostRequest request) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

        if (company.getApprovalStatus() != Company.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Company not yet approved by admin");
        }

        // Fetch required skills
        List<Skill> skills = new ArrayList<>();
        if (request.getRequiredSkillIds() != null) {
            skills = skillRepository.findAllById(request.getRequiredSkillIds());
        }

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .workMode(request.getWorkMode())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .minCgpa(request.getMinCgpa())
                .minExperience(request.getMinExperience())
                .deadline(request.getDeadline())
                .openings(request.getOpenings())
                .requiredSkills(skills)
                .status(Job.JobStatus.ACTIVE)
                .build();

        return jobRepository.save(job);
    }

    /**
     * Get all active jobs (public, with optional match score for logged-in students)
     */
    public List<Job> getActiveJobs() {
        return jobRepository.findActiveApprovedJobs();
    }

    /**
     * Get active jobs with match scores for a specific student
     */
    public List<Map<String, Object>> getJobsWithMatchScore(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Job> jobs = jobRepository.findActiveApprovedJobs();

        return jobs.stream().map(job -> {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("job", job);
            result.put("matchScore", matchingService.computeMatchScore(student, job));
            result.put("meetsMinimum", matchingService.meetsMinimumCriteria(student, job));
            return result;
        })
        .sorted((a, b) -> Double.compare(
                (Double) b.get("matchScore"), (Double) a.get("matchScore")))
        .collect(Collectors.toList());
    }

    /**
     * Get jobs posted by a specific company
     */
    public List<Job> getJobsByCompany(String companyEmail) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));
        return jobRepository.findByCompany(company);
    }

    /**
     * Get job by ID
     */
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }

    /**
     * Close a job posting
     */
    @Transactional
    public Job closeJob(Long jobId, String companyEmail) {
        Job job = getJobById(jobId);
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Unauthorized: Job does not belong to this company");
        }

        job.setStatus(Job.JobStatus.CLOSED);
        return jobRepository.save(job);
    }
}
