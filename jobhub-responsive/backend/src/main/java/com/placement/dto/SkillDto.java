package com.placement.dto;
public class SkillDto {
    private Long id; private String name,category,description;
    public SkillDto() {}
    public Long getId(){return id;} public void setId(Long i){id=i;}
    public String getName(){return name;} public void setName(String n){name=n;}
    public String getCategory(){return category;} public void setCategory(String c){category=c;}
    public String getDescription(){return description;} public void setDescription(String d){description=d;}
}
