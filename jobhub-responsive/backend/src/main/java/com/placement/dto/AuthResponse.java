package com.placement.dto;
public class AuthResponse {
    private String token; private String email; private String role;
    private Long profileId; private String name;
    public AuthResponse() {}
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String token,email,role,name; private Long profileId;
        public Builder token(String t){this.token=t;return this;}
        public Builder email(String e){this.email=e;return this;}
        public Builder role(String r){this.role=r;return this;}
        public Builder name(String n){this.name=n;return this;}
        public Builder profileId(Long p){this.profileId=p;return this;}
        public AuthResponse build(){
            AuthResponse a=new AuthResponse();a.token=token;a.email=email;
            a.role=role;a.name=name;a.profileId=profileId;return a;
        }
    }
}
