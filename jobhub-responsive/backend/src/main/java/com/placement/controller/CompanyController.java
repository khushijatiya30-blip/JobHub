package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.Company;
import com.placement.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Company Controller — profile management, certificate + logo upload
 */
@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /** GET /api/company/profile */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(Authentication auth) {
        var company = companyService.getCompanyByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", company));
    }

    /** PUT /api/company/profile — update company details */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(Authentication auth,
                                                      @RequestBody Company updates) {
        Company updated = companyService.updateProfile(auth.getName(), updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    /** POST /api/company/upload-certificate */
    @PostMapping("/upload-certificate")
    public ResponseEntity<ApiResponse> uploadCertificate(Authentication auth,
                                                          @RequestParam("file") MultipartFile file)
            throws IOException {
        String path = companyService.uploadCertificate(auth.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Certificate uploaded",
                Map.of("path", path)));
    }

    /** POST /api/company/upload-logo — company logo (PNG/JPG) */
    @PostMapping("/upload-logo")
    public ResponseEntity<ApiResponse> uploadLogo(Authentication auth,
                                                   @RequestParam("file") MultipartFile file)
            throws IOException {
        String path = companyService.uploadLogo(auth.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded", Map.of("path", path)));
    }
}
