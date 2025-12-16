package com.example.debtmarketplace.domain.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Data
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "uploaded_by_id")
    private UUID uploadedById;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_name")
    private String fileName;
}