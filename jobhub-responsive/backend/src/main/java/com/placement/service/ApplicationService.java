package com.placement.service;

import com.placement.model.*;
import com.placement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Application Service — apply, track, shortlist, reject
 */
@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final MatchingService matchingService;


    public ApplicationService(ApplicationRepository applicationRepository,
                       StudentRepository studentRepository,
                       JobRepository jobRepository,
                       UserRepository userRepository,
                       MatchingService matchingService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.matchingService = matchingService;
    }

    /**
     * Student applies for a job
     */
    @Transactional
    public Application applyForJob(String studentEmail, Long jobId, String coverLetter) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new RuntimeException("This job is no longer accepting applications");
        }
        if (applicationRepository.existsByStudentAndJob(student, job)) {
            throw new RuntimeException("You have already applied for this job");
        }

        double matchScore = matchingService.computeMatchScore(student, job);

        Application application = Application.builder()
                .student(student)
                .job(job)
                .coverLetter(coverLetter)
                .matchScore(matchScore)
                .status(Application.ApplicationStatus.APPLIED)
                .build();

        // Update student placement status
        if (student.getPlacementStatus() == Student.PlacementStatus.NOT_PLACED) {
            student.setPlacementStatus(Student.PlacementStatus.APPLIED);
            studentRepository.save(student);
        }

        return applicationRepository.save(application);
    }

    /**
     * Get all applications by a student
     */
    public List<Application> getStudentApplications(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return applicationRepository.findByStudent(student);
    }

    /**
     * Get all applicants for a job (company view)
     */
    public List<Application> getJobApplicants(Long jobId, String companyEmail) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCompany().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Job does not belong to this company");
        }
        return applicationRepository.findByJob(job);
    }

    /**
     * Company updates application status (shortlist / reject / select)
     */
    @Transactional
    public Application updateApplicationStatus(Long applicationId,
                                               String newStatus,
                                               String feedback,
                                               String companyEmail) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Application.ApplicationStatus status =
                Application.ApplicationStatus.valueOf(newStatus.toUpperCase());
        app.setStatus(status);
        if (feedback != null) app.setCompanyFeedback(feedback);

        // Update student placement status on selection
        if (status == Application.ApplicationStatus.SELECTED) {
            Student student = app.getStudent();
            student.setPlacementStatus(Student.PlacementStatus.PLACED);
            studentRepository.save(student);
        } else if (status == Application.ApplicationStatus.SHORTLISTED) {
            Student student = app.getStudent();
            if (student.getPlacementStatus() == Student.PlacementStatus.APPLIED) {
                student.setPlacementStatus(Student.PlacementStatus.SHORTLISTED);
                studentRepository.save(student);
            }
        }

        return applicationRepository.save(app);
    }

    /**
     * Get all applications (admin view)
     */
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}
