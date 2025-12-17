package com.example.debtmarketplace.domain.workmethod.repository;

import com.example.debtmarketplace.domain.workmethod.entity.WorkMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkMethodRepository extends JpaRepository<WorkMethod, UUID> {
}