package com.example.debtmarketplace.controller;

import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.service.OrderService;
import com.example.debtmarketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.debtmarketplace.domain.finance.entity.Transaction;
import com.example.debtmarketplace.domain.finance.repository.TransactionRepository;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;
    private final TransactionRepository transactionRepository;


    @GetMapping("/users")
    public List<User> getAllUsers(@RequestParam(required = false) String search) {
        return userService.getAllUsers(search);
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

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted");
    }

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}