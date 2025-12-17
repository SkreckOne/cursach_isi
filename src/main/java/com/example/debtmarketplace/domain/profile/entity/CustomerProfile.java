package com.example.debtmarketplace.domain.profile.entity;

import com.example.debtmarketplace.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "customer_profiles")
@Data
public class CustomerProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(unique = true)
    private String inn;
}