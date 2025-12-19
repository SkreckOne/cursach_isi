package com.example.debtmarketplace.domain.profile.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CollectorProfileDto {
    private String description;
    private BigDecimal hourlyRate;
    private String region;

    private List<UUID> workMethodIds;
}