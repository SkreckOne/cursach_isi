package com.example.debtmarketplace.domain.order.entity;

import com.example.debtmarketplace.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_applications")
@Data
public class OrderApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "collector_id", nullable = false)
    private User collector;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}