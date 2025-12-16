package com.example.debtmarketplace.domain.order.repository;

import com.example.debtmarketplace.domain.order.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
}