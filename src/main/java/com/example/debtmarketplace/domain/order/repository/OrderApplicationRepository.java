package com.example.debtmarketplace.domain.order.repository;

import com.example.debtmarketplace.domain.order.entity.OrderApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // <--- Import
import java.util.UUID;

public interface OrderApplicationRepository extends JpaRepository<OrderApplication, UUID> {
    List<OrderApplication> findAllByOrderId(UUID orderId);
    boolean existsByOrderIdAndCollectorId(UUID orderId, UUID collectorId);

    // НОВЫЙ МЕТОД: Найти заявку конкретного коллектора к конкретному заказу
    Optional<OrderApplication> findByOrderIdAndCollectorId(UUID orderId, UUID collectorId);

    // НОВЫЙ МЕТОД: Найти все заявки конкретного коллектора (чтобы знать ID заказов)
    List<OrderApplication> findAllByCollectorId(UUID collectorId);
}