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


    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    @JsonIgnore
    private Review review;

    @JsonProperty("hasReview")
    public boolean getHasReview() {
        return review != null;
    }
}