package com.example.debtmarketplace.controller;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.debtmarketplace.domain.order.dto.ApplicationDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getOrders(Authentication authentication,
                                 @RequestParam(required = false) String search) {
        return orderService.getOrdersForUser(authentication.getName(), search);
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

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyForOrder(@PathVariable UUID id, Authentication authentication) {
        try {
            orderService.applyForOrder(id, authentication.getName());
            return ResponseEntity.ok("Applied successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    @PostMapping("/{id}/approve-collector/{collectorId}")
    public ResponseEntity<?> approveCollector(
            @PathVariable UUID id,
            @PathVariable UUID collectorId,
            Authentication authentication
    ) {
        orderService.approveCollector(id, collectorId, authentication.getName());
        return ResponseEntity.ok("Collector approved");
    }

    // Получить отклики
    @GetMapping("/{id}/applications")
    public List<ApplicationDto> getApplications(@PathVariable UUID id) {
        // Сервис теперь возвращает DTO
        return orderService.getApplicationsForOrder(id);
    }

    // Отозвать заявку
    @DeleteMapping("/{id}/application")
    public ResponseEntity<?> withdrawApplication(@PathVariable UUID id, Authentication authentication) {
        orderService.withdrawApplication(id, authentication.getName());
        return ResponseEntity.ok("Application withdrawn");
    }

    // Получить список ID заказов, где я уже подал заявку (для фронта)
    @GetMapping("/my-applications")
    public List<UUID> getMyAppliedOrderIds(Authentication authentication) {
        return orderService.getMyAppliedOrderIds(authentication.getName());
    }
}