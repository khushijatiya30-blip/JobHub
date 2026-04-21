package com.placement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

/**
 * Static file serving config.
 * /uploads/** → disk ke uploads/ folder se serve hoga.
 * Resumes, Photos, Logos, Certificates — sab yahan accessible hain.
 *
 * FIX: Pehle Paths.get("uploads") relative tha — jar run karne ki directory pe depend karta tha.
 * Ab user.dir system property use karte hain jo always correct working dir deta hai.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // user.dir = jahan se Spring Boot run hota hai (project root / jar location)
        String workingDir = System.getProperty("user.dir");
        String uploadsPath = workingDir + File.separator + "uploads" + File.separator;

        // uploads folder create karo agar exist nahi karta
        new File(uploadsPath).mkdirs();
        new File(uploadsPath + "resumes").mkdirs();
        new File(uploadsPath + "photos").mkdirs();
        new File(uploadsPath + "logos").mkdirs();
        new File(uploadsPath + "certificates").mkdirs();

        // file:/// URI format mein convert karo
        String locationUri = "file:///" + uploadsPath.replace("\\", "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locationUri)
                .setCachePeriod(3600);
    }
}
