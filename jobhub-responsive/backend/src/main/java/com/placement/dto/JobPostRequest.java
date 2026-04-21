package com.placement.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public class JobPostRequest {
    @NotBlank private String title;
    private String description,location,jobType,workMode;
    private Double salaryMin,salaryMax,minCgpa;
    private Integer minExperience,openings;
    private LocalDate deadline;
    private List<Long> requiredSkillIds;
    public JobPostRequest() {}
    public String getTitle(){return title;} public void setTitle(String t){title=t;}
    public String getDescription(){return description;} public void setDescription(String d){description=d;}
    public String getLocation(){return location;} public void setLocation(String l){location=l;}
    public String getJobType(){return jobType;} public void setJobType(String j){jobType=j;}
    public String getWorkMode(){return workMode;} public void setWorkMode(String w){workMode=w;}
    public Double getSalaryMin(){return salaryMin;} public void setSalaryMin(Double s){salaryMin=s;}
    public Double getSalaryMax(){return salaryMax;} public void setSalaryMax(Double s){salaryMax=s;}
    public Double getMinCgpa(){return minCgpa;} public void setMinCgpa(Double m){minCgpa=m;}
    public Integer getMinExperience(){return minExperience;} public void setMinExperience(Integer m){minExperience=m;}
    public Integer getOpenings(){return openings;} public void setOpenings(Integer o){openings=o;}
    public LocalDate getDeadline(){return deadline;} public void setDeadline(LocalDate d){deadline=d;}
    public List<Long> getRequiredSkillIds(){return requiredSkillIds;} public void setRequiredSkillIds(List<Long> r){requiredSkillIds=r;}
}
