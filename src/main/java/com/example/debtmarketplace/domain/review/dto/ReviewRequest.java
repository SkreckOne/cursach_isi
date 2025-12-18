package com.example.debtmarketplace.domain.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ReviewRequest {
    @NotNull
    private UUID orderId;

    @Min(1) @Max(5)
    private Integer rating;

    private String comment;
}