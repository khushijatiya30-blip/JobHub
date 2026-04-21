package com.placement.dto;
import jakarta.validation.constraints.*;
public class CompanyRegisterRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6) private String password;
    @NotBlank private String companyName;
    @NotBlank
    @Pattern(regexp="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
             message="Invalid GST Number. Format: 22AAAAA0000A1Z5")
    private String gstNumber;

    // CIN Number (optional, 21 chars: L12345MH2000PLC123456)
    private String cinNumber;

    private String industry, website, phone, address, currentAddress, city, state, description;

    public CompanyRegisterRequest() {}
    public String getEmail(){return email;} public void setEmail(String e){email=e;}
    public String getPassword(){return password;} public void setPassword(String p){password=p;}
    public String getCompanyName(){return companyName;} public void setCompanyName(String n){companyName=n;}
    public String getGstNumber(){return gstNumber;} public void setGstNumber(String g){gstNumber=g;}
    public String getCinNumber(){return cinNumber;} public void setCinNumber(String c){cinNumber=c;}
    public String getIndustry(){return industry;} public void setIndustry(String i){industry=i;}
    public String getWebsite(){return website;} public void setWebsite(String w){website=w;}
    public String getPhone(){return phone;} public void setPhone(String p){phone=p;}
    public String getAddress(){return address;} public void setAddress(String a){address=a;}
    public String getCurrentAddress(){return currentAddress;} public void setCurrentAddress(String a){currentAddress=a;}
    public String getCity(){return city;} public void setCity(String c){city=c;}
    public String getState(){return state;} public void setState(String s){state=s;}
    public String getDescription(){return description;} public void setDescription(String d){description=d;}
}
