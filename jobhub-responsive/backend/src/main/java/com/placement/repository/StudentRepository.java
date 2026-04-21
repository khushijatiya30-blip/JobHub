package com.placement.repository;

import com.placement.model.Student;
import com.placement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    List<Student> findByPlacementStatus(Student.PlacementStatus status);
    long countByPlacementStatus(Student.PlacementStatus status);
}
