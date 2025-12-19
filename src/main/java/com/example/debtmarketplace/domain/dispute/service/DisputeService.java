package com.example.debtmarketplace.domain.dispute.service;

import com.example.debtmarketplace.domain.dispute.entity.Dispute;
import com.example.debtmarketplace.domain.dispute.repository.DisputeRepository;
import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.order.repository.OrderRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public void openDispute(UUID orderId, String email, String reason) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Order order = orderRepository.findById(orderId).orElseThrow();

        if (!order.getCustomerId().equals(user.getId())) {
            throw new RuntimeException("Not your order");
        }
        if (!"PENDING_REVIEW".equals(order.getStatus())) {
            throw new RuntimeException("Dispute can be opened only when order is Pending Review");
        }

        Dispute dispute = new Dispute();
        dispute.setOrder(order);
        dispute.setInitiator(user);
        dispute.setDescription(reason);
        dispute.setStatus("open");
        disputeRepository.save(dispute);

        order.setStatus("IN_DISPUTE");
        orderRepository.save(order);
    }

    @Transactional
    public void resolveDispute(UUID disputeId, boolean collectorWins, String adminComment) {
        Dispute dispute = disputeRepository.findById(disputeId).orElseThrow();
        Order order = dispute.getOrder();

        if (!"open".equals(dispute.getStatus())) {
            throw new RuntimeException("Dispute already resolved");
        }

        if (collectorWins) {

            order.setStatus("completed");
            orderRepository.saveAndFlush(order);

            orderRepository.completeOrderAndProcessPayment(order.getId(), order.getCustomerId());

            dispute.setResolution("Resolved in favor of Collector. " + adminComment);
        } else {

            order.setStatus("CANCELLED");
            orderRepository.save(order);

            dispute.setResolution("Resolved in favor of Customer. " + adminComment);
        }

        dispute.setStatus("resolved");
        disputeRepository.save(dispute);
    }

    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }
}