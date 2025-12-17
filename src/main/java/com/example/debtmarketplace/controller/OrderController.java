package com.example.debtmarketplace.controller;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getOrders(Authentication authentication) {
        // ИСПРАВЛЕНО: вызываем метод с фильтрацией по пользователю
        return orderService.getOrdersForUser(authentication.getName());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createOrder(
            Authentication authentication,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("file") MultipartFile file
    ) {
        // ИСПРАВЛЕНО: передаем email и вызываем createOrder
        return ResponseEntity.ok(orderService.createOrder(authentication.getName(), description, price, file));
    }

    @PostMapping("/{id}/moderate")
    public ResponseEntity<?> moderateOrder(
            @PathVariable UUID id,
            @RequestParam("approved") boolean approved,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        orderService.moderateOrder(id, approved, reason);
        return ResponseEntity.ok("Order moderated");
    }

    @PostMapping("/{id}/take")
    public ResponseEntity<?> takeOrder(@PathVariable UUID id, Authentication authentication) {
        orderService.takeOrder(id, authentication.getName());
        return ResponseEntity.ok("Order taken");
    }

    @PostMapping(value = "/{id}/submit-proof", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitProof(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestParam("proofText") String proofText,
            @RequestParam("proofFile") MultipartFile proofFile
    ) {
        orderService.submitProof(id, authentication.getName(), proofText, proofFile);
        return ResponseEntity.ok("Proof submitted");
    }

    @PostMapping("/{id}/approve-completion")
    public ResponseEntity<?> approveCompletion(@PathVariable UUID id, Authentication authentication) {
        // Передаем email (authentication.getName()), чтобы определить, кто подтверждает
        orderService.approveCompletion(id, authentication.getName());
        return ResponseEntity.ok("Order completed successfully");
    }
}