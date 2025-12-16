package com.example.debtmarketplace.domain.user.entity;

import com.example.debtmarketplace.domain.user.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    // --- УБРАЛИ PHONE (нет в БД) ---
    // Если хотите вернуть, нужно сначала выполнить в БД:
    // ALTER TABLE users ADD COLUMN phone VARCHAR(255);

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // --- УБРАЛИ isActive и isVerified (нет в БД, используем verificationStatus) ---

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", columnDefinition = "verification_status", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.not_verified;

    @Builder.Default
    @Column(name = "is_blocked", nullable = false)
    private boolean isBlocked = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    // --- УБРАЛИ updatedAt (нет в БД) ---
}