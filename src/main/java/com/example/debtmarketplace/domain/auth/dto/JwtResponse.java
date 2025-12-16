package com.example.debtmarketplace.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private UUID id;
    private String email;
    private String role;
}