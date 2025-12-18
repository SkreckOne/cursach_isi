package com.example.debtmarketplace.domain.review.entity;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "collector_id", nullable = false)
    private User collector;

    @Column(nullable = false)
    private Integer rating; // 1-5

    private String comment;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}