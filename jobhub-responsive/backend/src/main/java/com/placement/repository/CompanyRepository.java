package com.placement.repository;

import com.placement.model.Company;
import com.placement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUser(User user);
    Optional<Company> findByUserId(Long userId);
    boolean existsByGstNumber(String gstNumber);
    List<Company> findByApprovalStatus(Company.ApprovalStatus status);
}
