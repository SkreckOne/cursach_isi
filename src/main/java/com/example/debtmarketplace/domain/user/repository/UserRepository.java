package com.example.debtmarketplace.domain.user.repository;

import com.example.debtmarketplace.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    java.util.Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByEmailContainingIgnoreCase(String email);
}