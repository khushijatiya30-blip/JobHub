package com.placement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnoreProperties({"user"})
    private Company company;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;
    private String jobType;
    private String workMode;
    private Double salaryMin;
    private Double salaryMax;
    private Double minCgpa;
    private Integer minExperience;
    private LocalDate deadline;
    private Integer openings;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    @Column(updatable = false)
    private LocalDateTime postedAt;

    @PrePersist
    protected void onCreate() { postedAt = LocalDateTime.now(); }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "job_required_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> requiredSkills = new ArrayList<>();

    public enum JobStatus { ACTIVE, CLOSED, DRAFT }

    public Job() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public Double getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Double salaryMin) { this.salaryMin = salaryMin; }
    public Double getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Double salaryMax) { this.salaryMax = salaryMax; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public List<Skill> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<Skill> requiredSkills) { this.requiredSkills = requiredSkills; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Company company; private String title; private String description;
        private String location; private String jobType; private String workMode;
        private Double salaryMin; private Double salaryMax; private Double minCgpa;
        private Integer minExperience; private LocalDate deadline; private Integer openings;
        private List<Skill> requiredSkills = new ArrayList<>();
        private JobStatus status = JobStatus.ACTIVE;
        public Builder company(Company c) { this.company = c; return this; }
        public Builder title(String t) { this.title = t; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public Builder location(String l) { this.location = l; return this; }
        public Builder jobType(String jt) { this.jobType = jt; return this; }
        public Builder workMode(String wm) { this.workMode = wm; return this; }
        public Builder salaryMin(Double s) { this.salaryMin = s; return this; }
        public Builder salaryMax(Double s) { this.salaryMax = s; return this; }
        public Builder minCgpa(Double m) { this.minCgpa = m; return this; }
        public Builder minExperience(Integer m) { this.minExperience = m; return this; }
        public Builder deadline(LocalDate d) { this.deadline = d; return this; }
        public Builder openings(Integer o) { this.openings = o; return this; }
        public Builder requiredSkills(List<Skill> rs) { this.requiredSkills = rs != null ? rs : new ArrayList<>(); return this; }
        public Builder status(JobStatus s) { this.status = s; return this; }
        public Job build() {
            Job j = new Job();
            j.company = company; j.title = title; j.description = description;
            j.location = location; j.jobType = jobType; j.workMode = workMode;
            j.salaryMin = salaryMin; j.salaryMax = salaryMax; j.minCgpa = minCgpa;
            j.minExperience = minExperience; j.deadline = deadline; j.openings = openings;
            j.requiredSkills = requiredSkills; j.status = status;
            return j;
        }
    }
}
