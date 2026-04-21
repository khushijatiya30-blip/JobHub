package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.Student;
import com.placement.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Student Controller — profile, skills, resume
 */
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;
    private final ApplicationService applicationService;


    public StudentController(StudentService studentService,
            ApplicationService applicationService) {
        this.studentService = studentService;
        this.applicationService = applicationService;
    }

    /** GET /api/student/profile */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(Authentication auth) {
        Student student = studentService.getStudentByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", student));
    }

    /** PUT /api/student/profile */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(Authentication auth,
                                                      @RequestBody Student updates) {
        Student updated = studentService.updateProfile(auth.getName(), updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    /** POST /api/student/skills/{skillId} — add skill */
    @PostMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse> addSkill(Authentication auth,
                                                 @PathVariable Long skillId) {
        Student student = studentService.addSkill(auth.getName(), skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill added", student.getSkills()));
    }

    /** DELETE /api/student/skills/{skillId} — remove skill */
    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse> removeSkill(Authentication auth,
                                                    @PathVariable Long skillId) {
        Student student = studentService.removeSkill(auth.getName(), skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed", student.getSkills()));
    }

    /** POST /api/student/resume — upload resume PDF */
    @PostMapping("/resume")
    public ResponseEntity<ApiResponse> uploadResume(Authentication auth,
                                                     @RequestParam("file") MultipartFile file)
            throws IOException {
        String path = studentService.uploadResume(auth.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded", Map.of("path", path)));
    }

    /** POST /api/student/photo — upload profile photo (PNG/JPG) */
    @PostMapping("/photo")
    public ResponseEntity<ApiResponse> uploadPhoto(Authentication auth,
                                                    @RequestParam("file") MultipartFile file)
            throws IOException {
        String path = studentService.uploadPhoto(auth.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded", Map.of("path", path)));
    }

    /** GET /api/student/applications — my applications */
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse> myApplications(Authentication auth) {
        var apps = applicationService.getStudentApplications(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", apps));
    }

    /** GET /api/student/skills/suggest?q=java */
    @GetMapping("/skills/suggest")
    public ResponseEntity<ApiResponse> suggestSkills(@RequestParam("q") String keyword) {
        var skills = studentService.suggestSkills(keyword);
        return ResponseEntity.ok(ApiResponse.success("Suggestions", skills));
    }
}
