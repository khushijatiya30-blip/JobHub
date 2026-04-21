package com.placement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, length = 15)
    private String gstNumber;

    @Column(length = 21)
    private String cinNumber;

    private String certificatePath;
    private String industry;
    private String website;
    private String phone;
    private String address;
    private String currentAddress;
    private String city;
    private String state;
    private String logoPath;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private String rejectionReason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum ApprovalStatus { PENDING, APPROVED, REJECTED }

    public Company() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }
    public String getCertificatePath() { return certificatePath; }
    public void setCertificatePath(String certificatePath) { this.certificatePath = certificatePath; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getLogoPath() { return logoPath; }
    public void setLogoPath(String logoPath) { this.logoPath = logoPath; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User user; private String companyName; private String gstNumber;
        private String industry; private String website; private String phone;
        private String address; private String city; private String state;
        private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
        public Builder user(User u) { this.user = u; return this; }
        public Builder companyName(String n) { this.companyName = n; return this; }
        public Builder gstNumber(String g) { this.gstNumber = g; return this; }
        public Builder industry(String i) { this.industry = i; return this; }
        public Builder website(String w) { this.website = w; return this; }
        public Builder phone(String p) { this.phone = p; return this; }
        public Builder address(String a) { this.address = a; return this; }
        public Builder city(String c) { this.city = c; return this; }
        public Builder state(String s) { this.state = s; return this; }
        public Builder approvalStatus(ApprovalStatus as) { this.approvalStatus = as; return this; }
        public Company build() {
            Company c = new Company();
            c.user = user; c.companyName = companyName; c.gstNumber = gstNumber;
            c.industry = industry; c.website = website; c.phone = phone;
            c.address = address; c.city = city; c.state = state;
            c.approvalStatus = approvalStatus;
            return c;
        }
    }
}
