package com.example.debtmarketplace.domain.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ApplicationDto {
    private UUID id;
    private UUID collectorId;
    private String email;
    private BigDecimal rating;
    private BigDecimal hourlyRate;
    private String region;
    private OffsetDateTime appliedAt;
}