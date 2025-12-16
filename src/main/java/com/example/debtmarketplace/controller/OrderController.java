package com.example.debtmarketplace.controller;

// ИМПОРТЫ ИЗМЕНИЛИСЬ:
import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createOrder(
            @RequestParam("customerId") UUID customerId,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            Order order = orderService.createOrderWithAttachment(customerId, description, price, file);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}