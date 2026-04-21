package com.placement.dto;
import jakarta.validation.constraints.*;
public class ApplyRequest {
    @NotNull private Long jobId;
    private String coverLetter;
    public ApplyRequest() {}
    public Long getJobId(){return jobId;} public void setJobId(Long j){jobId=j;}
    public String getCoverLetter(){return coverLetter;} public void setCoverLetter(String c){coverLetter=c;}
}
