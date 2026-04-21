package com.placement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;
    private String description;

    public Skill() {}
    public Skill(Long id, String name, String category, String description) {
        this.id = id; this.name = name; this.category = category; this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String name; private String category; private String description;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder category(String cat) { this.category = cat; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public Skill build() {
            Skill s = new Skill(); s.id = id; s.name = name;
            s.category = category; s.description = description; return s;
        }
    }
}
