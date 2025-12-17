package com.example.debtmarketplace.controller;

import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.service.OrderService;
import com.example.debtmarketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// Гарантируем, что сюда зайдет только Админ (хотя SecurityConfig тоже защищает)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    // --- ПОЛЬЗОВАТЕЛИ ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable UUID id) {
        userService.verifyUser(id);
        return ResponseEntity.ok("User verified");
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable UUID id, @RequestParam boolean blocked) {
        userService.blockUser(id, blocked);
        return ResponseEntity.ok(blocked ? "User blocked" : "User unblocked");
    }

    // --- ЗАКАЗЫ ---

    // Удаление заказа (жесткое)
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted");
    }
}