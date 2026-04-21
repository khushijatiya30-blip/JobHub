package com.placement.dto;
import jakarta.validation.constraints.*;
public class StudentRegisterRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6) private String password;
    @NotBlank private String name;
    private String phone; private String branch; private String college;
    private Integer graduationYear; private Double cgpa;
    public StudentRegisterRequest() {}
    public String getEmail(){return email;} public void setEmail(String e){email=e;}
    public String getPassword(){return password;} public void setPassword(String p){password=p;}
    public String getName(){return name;} public void setName(String n){name=n;}
    public String getPhone(){return phone;} public void setPhone(String p){phone=p;}
    public String getBranch(){return branch;} public void setBranch(String b){branch=b;}
    public String getCollege(){return college;} public void setCollege(String c){college=c;}
    public Integer getGraduationYear(){return graduationYear;} public void setGraduationYear(Integer y){graduationYear=y;}
    public Double getCgpa(){return cgpa;} public void setCgpa(Double c){cgpa=c;}
}
