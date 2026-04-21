package com.placement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for the Student Skill Tracking & Placement System
 * Author: Placement System Team
 */
@SpringBootApplication
@EnableAsync
public class PlacementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementSystemApplication.class, args);
        System.out.println("====================================================");
        System.out.println("  Student Skill Tracking & Placement System Started ");
        System.out.println("  Backend running at: http://localhost:8080          ");
        System.out.println("====================================================");
    }
}
