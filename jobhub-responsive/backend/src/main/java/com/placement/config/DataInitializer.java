package com.placement.config;

import com.placement.model.Skill;
import com.placement.model.User;
import com.placement.repository.SkillRepository;
import com.placement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SkillRepository skillRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedSkills();
    }

    private void seedAdmin() {
        // Check for admin@jobhub.com (new) or admin@placement.com (legacy) — fix both
        java.util.Optional<User> existing = userRepository.findByEmail("admin@jobhub.com");
        if (existing.isEmpty()) {
            existing = userRepository.findByEmail("admin@placement.com");
        }

        if (existing.isPresent()) {
            // Admin already exists — make sure it is enabled and has correct role
            User admin = existing.get();
            boolean changed = false;
            if (!admin.isEnabled()) {
                admin.setEnabled(true);
                changed = true;
            }
            if (admin.getRole() != User.Role.ADMIN) {
                admin.setRole(User.Role.ADMIN);
                changed = true;
            }
            // Update email to new jobhub domain if still old
            if ("admin@placement.com".equals(admin.getEmail())) {
                admin.setEmail("admin@jobhub.com");
                // Also reset password so it is guaranteed correct
                admin.setPassword(passwordEncoder.encode("admin123"));
                changed = true;
            }
            if (changed) {
                userRepository.save(admin);
                System.out.println("✅ Admin user updated: admin@jobhub.com / admin123");
            } else {
                System.out.println("✅ Admin user OK: admin@jobhub.com");
            }
        } else {
            // Create fresh admin
            User admin = User.builder()
                    .email("admin@jobhub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin user created: admin@jobhub.com / admin123");
        }
    }

    private void seedSkills() {
        List<String[]> skills = List.of(
            new String[]{"Java","Programming Language"}, new String[]{"Python","Programming Language"},
            new String[]{"JavaScript","Programming Language"}, new String[]{"TypeScript","Programming Language"},
            new String[]{"C++","Programming Language"}, new String[]{"C#","Programming Language"},
            new String[]{"Go","Programming Language"}, new String[]{"Kotlin","Programming Language"},
            new String[]{"Spring Boot","Framework"}, new String[]{"React","Framework"},
            new String[]{"Angular","Framework"}, new String[]{"Vue.js","Framework"},
            new String[]{"Node.js","Framework"}, new String[]{"Django","Framework"},
            new String[]{"FastAPI","Framework"}, new String[]{"Flutter","Framework"},
            new String[]{"MySQL","Database"}, new String[]{"PostgreSQL","Database"},
            new String[]{"MongoDB","Database"}, new String[]{"Redis","Database"},
            new String[]{"AWS","Cloud"}, new String[]{"Azure","Cloud"},
            new String[]{"Docker","DevOps"}, new String[]{"Kubernetes","DevOps"},
            new String[]{"Git","DevOps"}, new String[]{"CI/CD","DevOps"},
            new String[]{"Machine Learning","Data Science"}, new String[]{"Data Analysis","Data Science"},
            new String[]{"TensorFlow","Data Science"}, new String[]{"SQL","Data Science"},
            new String[]{"REST APIs","Web Development"}, new String[]{"GraphQL","Web Development"},
            new String[]{"HTML/CSS","Web Development"}, new String[]{"Linux","Systems"},
            new String[]{"Agile/Scrum","Methodology"}
        );
        for (String[] s : skills) {
            if (skillRepository.findByNameIgnoreCase(s[0]).isEmpty()) {
                Skill skill = Skill.builder().name(s[0]).category(s[1]).build();
                skillRepository.save(skill);
            }
        }
        System.out.println("✅ Skills seeded: " + skillRepository.count() + " total");
    }
}
