package com.example.debtmarketplace.domain.user.repository;

import com.example.debtmarketplace.domain.user.entity.Role;
import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(UserRoleEnum name);
}