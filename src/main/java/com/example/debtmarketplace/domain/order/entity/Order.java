package com.example.debtmarketplace.domain.order.entity;

import com.example.debtmarketplace.domain.review.entity.Review; // <--- ИМПОРТ
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- ИМПОРТ
import com.fasterxml.jackson.annotation.JsonProperty; // <--- ИМПОРТ
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

    // ... (все старые поля: customerId, collectorId, status, description, price...) ...
    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "collector_id")
    private UUID collectorId;

    @Column(name = "status")
    private String status;

    private String description;
    private BigDecimal price;

    @Column(name = "moderation_comment")
    private String moderationComment;

    @Column(name = "proof_description")
    private String proofDescription;

    @Column(name = "proof_file_path")
    private String proofFilePath;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    // --- НОВОЕ: СВЯЗЬ С ОТЗЫВОМ ---

    // mappedBy = "order" указывает на поле 'order' в классе Review
    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    @JsonIgnore // Важно! Не отправляем весь объект отзыва, чтобы не было зацикливания JSON
    private Review review;

    // Это поле автоматически попадет в JSON как "hasReview": true/false
    @JsonProperty("hasReview")
    public boolean getHasReview() {
        return review != null;
    }
}