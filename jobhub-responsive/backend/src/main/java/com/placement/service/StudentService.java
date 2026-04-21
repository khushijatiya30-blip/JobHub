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
 * Student Service — profile management, skills, resume upload
 */
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/resumes/";
    private static final String PHOTO_DIR  = "uploads/photos/";


    public StudentService(StudentRepository studentRepository,
                       SkillRepository skillRepository,
                       UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get student profile by user email
     */
    public Student getStudentByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    /**
     * Get student by ID
     */
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    /**
     * Update student profile
     */
    @Transactional
    public Student updateProfile(String email, Student updates) {
        Student student = getStudentByEmail(email);
        if (updates.getName()           != null) student.setName(updates.getName());
        if (updates.getPhone()          != null) student.setPhone(updates.getPhone());
        if (updates.getBranch()         != null) student.setBranch(updates.getBranch());
        if (updates.getCollege()        != null) student.setCollege(updates.getCollege());
        if (updates.getGraduationYear() != null) student.setGraduationYear(updates.getGraduationYear());
        if (updates.getCgpa()           != null) student.setCgpa(updates.getCgpa());
        if (updates.getLinkedinUrl()    != null) student.setLinkedinUrl(updates.getLinkedinUrl());
        if (updates.getGithubUrl()      != null) student.setGithubUrl(updates.getGithubUrl());
        if (updates.getAddress()        != null) student.setAddress(updates.getAddress());
        return studentRepository.save(student);
    }

    /**
     * Add a skill to student profile
     */
    @Transactional
    public Student addSkill(String email, Long skillId) {
        Student student = getStudentByEmail(email);
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found: " + skillId));

        boolean alreadyAdded = student.getSkills().stream()
                .anyMatch(s -> s.getId().equals(skillId));
        if (!alreadyAdded) {
            student.getSkills().add(skill);
            studentRepository.save(student);
        }
        return student;
    }

    /**
     * Remove a skill from student profile
     */
    @Transactional
    public Student removeSkill(String email, Long skillId) {
        Student student = getStudentByEmail(email);
        student.getSkills().removeIf(s -> s.getId().equals(skillId));
        return studentRepository.save(student);
    }

    /**
     * Upload resume PDF
     */
    @Transactional
    public String uploadResume(String email, MultipartFile file) throws IOException {
        Student student = getStudentByEmail(email);

        // Validate file type
        String contentType = file.getContentType();
        if (!"application/pdf".equals(contentType)) {
            throw new RuntimeException("Only PDF files are allowed for resume");
        }

        // Create uploads directory if missing
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save with unique filename
        String filename = "resume_" + student.getId() + "_" + UUID.randomUUID() + ".pdf";
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        student.setResumePath(UPLOAD_DIR + filename);
        studentRepository.save(student);

        return student.getResumePath();
    }

    /**
     * Upload profile photo (PNG/JPG)
     */
    @Transactional
    public String uploadPhoto(String email, MultipartFile file) throws IOException {
        Student student = getStudentByEmail(email);
        String ct = file.getContentType();
        if (ct == null || (!ct.equals("image/png") && !ct.equals("image/jpeg") && !ct.equals("image/jpg")))
            throw new RuntimeException("Only PNG/JPG images allowed for profile photo");

        Path uploadPath = Paths.get(PHOTO_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String ext      = ct.equals("image/png") ? ".png" : ".jpg";
        String filename = "photo_" + student.getId() + "_" + UUID.randomUUID() + ext;
        Path filePath   = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        student.setProfilePhoto(PHOTO_DIR + filename);
        studentRepository.save(student);
        return student.getProfilePhoto();
    }

    /**
     * Get all students (for admin)
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Get skill suggestions by keyword
     */
    public List<Skill> suggestSkills(String keyword) {
        return skillRepository.findByNameContainingIgnoreCase(keyword);
    }
}
