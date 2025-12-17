package com.example.debtmarketplace.domain.profile.repository;

import com.example.debtmarketplace.domain.profile.entity.CollectorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CollectorProfileRepository extends JpaRepository<CollectorProfile, UUID> {
}