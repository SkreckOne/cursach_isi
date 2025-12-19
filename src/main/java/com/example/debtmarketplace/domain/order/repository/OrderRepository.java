package com.example.debtmarketplace.domain.order.repository;

import com.example.debtmarketplace.domain.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findAllByCustomerId(UUID customerId);
    List<Order> findAllByStatus(String status);
    List<Order> findAllByCollectorId(UUID collectorId);

    @Procedure(procedureName = "complete_order_and_process_payment")
    void completeOrderAndProcessPayment(UUID p_order_id, UUID p_customer_id);
}