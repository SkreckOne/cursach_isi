package com.example.debtmarketplace.domain.user.entity;

import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode; // Новый импорт для Hibernate 6
import org.hibernate.type.SqlTypes;         // Новый импорт для типов SQL

import java.util.UUID;

@Entity
@Table(name = "roles")
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Для Hibernate 6 и UUID лучше использовать UUID, а не AUTO
    private UUID id;

    // Решение 1Б: Маппинг на нативный Postgres ENUM
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "name", nullable = false, unique = true)
    private UserRoleEnum name;
}