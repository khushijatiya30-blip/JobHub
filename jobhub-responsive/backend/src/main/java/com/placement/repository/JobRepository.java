package com.placement.repository;

import com.placement.model.Company;
import com.placement.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompany(Company company);
    List<Job> findByStatus(Job.JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.company.approvalStatus = 'APPROVED'")
    List<Job> findActiveApprovedJobs();

    long countByStatus(Job.JobStatus status);
}
