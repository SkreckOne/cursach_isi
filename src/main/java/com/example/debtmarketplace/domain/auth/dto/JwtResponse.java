package com.example.debtmarketplace.domain.auth.dto;

import java.util.UUID;

public class JwtResponse {
    private String token;
    private UUID id;
    private String email;
    private String role;

    public JwtResponse(String token, UUID id, String email, String role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
    }

    // Геттеры обязательны для сериализации в JSON
    public String getToken() {
        return token;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}