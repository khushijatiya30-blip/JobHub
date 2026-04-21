package com.placement.service;

import com.placement.model.*;
import com.placement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Company Service — profile management, certificate/logo upload, admin approval
 */
@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    private static final String CERT_UPLOAD_DIR  = "uploads/certificates/";
    private static final String LOGO_UPLOAD_DIR  = "uploads/logos/";

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository    = userRepository;
    }

    /** Get company by user email */
    public Company getCompanyByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));
    }

    /** Get company by ID */
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));
    }

    /** Update company profile fields */
    @Transactional
    public Company updateProfile(String email, Company updates) {
        Company company = getCompanyByEmail(email);
        if (updates.getCompanyName()    != null) company.setCompanyName(updates.getCompanyName());
        if (updates.getCinNumber()      != null) company.setCinNumber(updates.getCinNumber());
        if (updates.getIndustry()       != null) company.setIndustry(updates.getIndustry());
        if (updates.getWebsite()        != null) company.setWebsite(updates.getWebsite());
        if (updates.getPhone()          != null) company.setPhone(updates.getPhone());
        if (updates.getAddress()        != null) company.setAddress(updates.getAddress());
        if (updates.getCurrentAddress() != null) company.setCurrentAddress(updates.getCurrentAddress());
        if (updates.getCity()           != null) company.setCity(updates.getCity());
        if (updates.getState()          != null) company.setState(updates.getState());
        if (updates.getDescription()    != null) company.setDescription(updates.getDescription());
        return companyRepository.save(company);
    }

    /** Upload registration certificate (PDF) */
    @Transactional
    public String uploadCertificate(String email, MultipartFile file) throws IOException {
        Company company = getCompanyByEmail(email);
        if (!"application/pdf".equals(file.getContentType()))
            throw new RuntimeException("Only PDF files allowed for certificate");

        Path uploadPath = Paths.get(CERT_UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String filename = "cert_" + company.getId() + "_" + UUID.randomUUID() + ".pdf";
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        company.setCertificatePath(CERT_UPLOAD_DIR + filename);
        companyRepository.save(company);
        return company.getCertificatePath();
    }

    /** Upload company logo (PNG / JPG / JPEG) */
    @Transactional
    public String uploadLogo(String email, MultipartFile file) throws IOException {
        Company company = getCompanyByEmail(email);
        String ct = file.getContentType();
        if (ct == null || (!ct.equals("image/png") && !ct.equals("image/jpeg") && !ct.equals("image/jpg")))
            throw new RuntimeException("Only PNG/JPG images allowed for logo");

        Path uploadPath = Paths.get(LOGO_UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String ext      = ct.equals("image/png") ? ".png" : ".jpg";
        String filename = "logo_" + company.getId() + "_" + UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        company.setLogoPath(LOGO_UPLOAD_DIR + filename);
        companyRepository.save(company);
        return company.getLogoPath();
    }

    /** Admin: approve a company */
    @Transactional
    public Company approveCompany(Long companyId) {
        Company company = getCompanyById(companyId);
        company.setApprovalStatus(Company.ApprovalStatus.APPROVED);
        company.setRejectionReason(null);
        return companyRepository.save(company);
    }

    /** Admin: reject a company */
    @Transactional
    public Company rejectCompany(Long companyId, String reason) {
        Company company = getCompanyById(companyId);
        company.setApprovalStatus(Company.ApprovalStatus.REJECTED);
        company.setRejectionReason(reason);
        return companyRepository.save(company);
    }

    /** Get all companies (admin) */
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    /** Get pending companies (admin) */
    public List<Company> getPendingCompanies() {
        return companyRepository.findByApprovalStatus(Company.ApprovalStatus.PENDING);
    }
}
