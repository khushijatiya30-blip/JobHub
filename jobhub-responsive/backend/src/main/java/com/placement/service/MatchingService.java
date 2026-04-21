package com.placement.service;

import com.placement.model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Smart Matching Algorithm
 *
 * Match Score = (Skill Match % × 0.6) + (CGPA Weight × 0.3) + (Experience Weight × 0.1)
 *
 * - Skill Match %  : how many required skills the student has
 * - CGPA Weight    : student CGPA normalised against job's minCgpa requirement
 * - Experience     : capped at 1.0 (no experience = 0.5 base)
 */
@Service
public class MatchingService {

    private static final double SKILL_WEIGHT      = 0.60;
    private static final double CGPA_WEIGHT       = 0.30;
    private static final double EXPERIENCE_WEIGHT = 0.10;

    /**
     * Compute a 0-100 match score for a student applying to a job
     */
    public double computeMatchScore(Student student, Job job) {

        // ── 1. Skill Match ──────────────────────────────────────────
        List<Skill> required  = job.getRequiredSkills();
        List<Skill> studentSk = student.getSkills();

        double skillScore = 0.0;
        if (!required.isEmpty()) {
            Set<Long> studentSkillIds = studentSk.stream()
                    .map(Skill::getId)
                    .collect(Collectors.toSet());

            long matched = required.stream()
                    .filter(s -> studentSkillIds.contains(s.getId()))
                    .count();

            skillScore = (double) matched / required.size();
        } else {
            skillScore = 1.0; // no skills required → full score
        }

        // ── 2. CGPA Weight ──────────────────────────────────────────
        double cgpaScore = 0.0;
        if (student.getCgpa() != null) {
            double minRequired = (job.getMinCgpa() != null) ? job.getMinCgpa() : 0.0;
            if (minRequired == 0.0) {
                cgpaScore = student.getCgpa() / 10.0; // normalise out of 10
            } else {
                cgpaScore = Math.min(student.getCgpa() / minRequired, 1.0);
            }
        }

        // ── 3. Experience Weight ────────────────────────────────────
        // Fresh students get 0.5 base; actual experience calc can be extended
        double expScore = 0.5;

        // ── 4. Weighted Sum ─────────────────────────────────────────
        double rawScore = (skillScore * SKILL_WEIGHT)
                        + (cgpaScore  * CGPA_WEIGHT)
                        + (expScore   * EXPERIENCE_WEIGHT);

        // Round to 2 decimal places, expressed as 0-100
        return Math.round(rawScore * 100.0 * 100.0) / 100.0;
    }

    /**
     * Check if student meets the minimum criteria for a job
     */
    public boolean meetsMinimumCriteria(Student student, Job job) {
        if (job.getMinCgpa() != null && student.getCgpa() != null) {
            if (student.getCgpa() < job.getMinCgpa()) {
                return false;
            }
        }
        return true;
    }
}
