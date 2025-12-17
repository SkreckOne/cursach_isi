package com.example.debtmarketplace.domain.profile.repository;

import com.example.debtmarketplace.domain.profile.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
}