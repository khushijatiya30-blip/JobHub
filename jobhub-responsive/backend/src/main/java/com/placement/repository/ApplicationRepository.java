package com.placement.repository;

import com.placement.model.Application;
import com.placement.model.Job;
import com.placement.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    List<Application> findByJob(Job job);
    Optional<Application> findByStudentAndJob(Student student, Job job);
    boolean existsByStudentAndJob(Student student, Job job);
    long countByStatus(Application.ApplicationStatus status);
}
