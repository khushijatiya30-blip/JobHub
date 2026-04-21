package com.placement.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "job_id"})
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"skills", "applications"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    // FIX: "company" ko ignore list se hataya — company name dikhne ke liye zaroori hai
    // FIX: Infinite loop rokne ke liye company ke andar "user" aur "jobs" ignore karo
    @JsonIgnoreProperties({"requiredSkills", "applications"})
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private Double matchScore;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private String companyFeedback;

    @Column(updatable = false)
    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum ApplicationStatus {
        APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEWED, SELECTED, REJECTED
    }

    public Application() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public String getCompanyFeedback() { return companyFeedback; }
    public void setCompanyFeedback(String companyFeedback) { this.companyFeedback = companyFeedback; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Student student; private Job job;
        private ApplicationStatus status = ApplicationStatus.APPLIED;
        private Double matchScore; private String coverLetter;
        public Builder student(Student s) { this.student = s; return this; }
        public Builder job(Job j) { this.job = j; return this; }
        public Builder status(ApplicationStatus s) { this.status = s; return this; }
        public Builder matchScore(Double m) { this.matchScore = m; return this; }
        public Builder coverLetter(String c) { this.coverLetter = c; return this; }
        public Application build() {
            Application a = new Application();
            a.student = student; a.job = job; a.status = status;
            a.matchScore = matchScore; a.coverLetter = coverLetter;
            return a;
        }
    }
}