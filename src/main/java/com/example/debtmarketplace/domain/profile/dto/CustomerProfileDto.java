package com.example.debtmarketplace.domain.profile.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerProfileDto {
    private String companyName;

    // Добавляем проверку длины на уровне Java
    @Size(max = 12, message = "INN cannot exceed 12 characters")
    private String inn;
}