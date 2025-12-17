package com.example.debtmarketplace.domain.profile.entity;

import com.example.debtmarketplace.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "collector_profiles")
@Data
public class CollectorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String description;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

    @Column(name = "success_rate")
    private BigDecimal successRate; // Обычно рассчитывается системой, но дадим возможность заполнить для старта

    private String region;

    @Column(name = "average_rating")
    private BigDecimal averageRating;
}