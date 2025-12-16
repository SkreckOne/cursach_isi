package com.example.debtmarketplace.domain.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "collector_id")
    private UUID collectorId;

    // Пока оставим String, позже переделаем на Enum OrderStatus
    @Column(name = "status")
    private String status;

    private String description;

    private BigDecimal price;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}