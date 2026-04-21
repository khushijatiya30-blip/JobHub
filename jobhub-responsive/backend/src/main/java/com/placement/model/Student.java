package com.placement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User user;

    @Column(nullable = false)
    private String name;
    private String phone;
    private String branch;
    private String college;
    private Integer graduationYear;
    private Double cgpa;
    private String resumePath;
    private String profilePhoto;
    private String address;
    private String linkedinUrl;
    private String githubUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "placement_status")
    private PlacementStatus placementStatus = PlacementStatus.NOT_PLACED;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "student_skills",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> skills = new ArrayList<>();

    public enum PlacementStatus { NOT_PLACED, APPLIED, SHORTLISTED, PLACED }

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public PlacementStatus getPlacementStatus() { return placementStatus; }
    public void setPlacementStatus(PlacementStatus placementStatus) { this.placementStatus = placementStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User user; private String name; private String phone; private String branch;
        private String college; private Integer graduationYear; private Double cgpa;
        private PlacementStatus placementStatus = PlacementStatus.NOT_PLACED;
        public Builder user(User u) { this.user = u; return this; }
        public Builder name(String n) { this.name = n; return this; }
        public Builder phone(String p) { this.phone = p; return this; }
        public Builder branch(String b) { this.branch = b; return this; }
        public Builder college(String c) { this.college = c; return this; }
        public Builder graduationYear(Integer y) { this.graduationYear = y; return this; }
        public Builder cgpa(Double c) { this.cgpa = c; return this; }
        public Builder placementStatus(PlacementStatus ps) { this.placementStatus = ps; return this; }
        public Student build() {
            Student s = new Student();
            s.user = user; s.name = name; s.phone = phone; s.branch = branch;
            s.college = college; s.graduationYear = graduationYear;
            s.cgpa = cgpa; s.placementStatus = placementStatus;
            return s;
        }
    }
}
