package com.example.debtmarketplace.domain.dispute.entity;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "disputes")
@Data
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "initiator_id")
    private User initiator;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String description;

    private String resolution;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}