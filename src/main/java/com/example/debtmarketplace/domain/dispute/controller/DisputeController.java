package com.example.debtmarketplace.domain.dispute.controller;

import com.example.debtmarketplace.domain.dispute.entity.Dispute;
import com.example.debtmarketplace.domain.dispute.service.DisputeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<?> openDispute(Authentication authentication,
                                         @RequestParam UUID orderId,
                                         @RequestParam String reason) {
        disputeService.openDispute(orderId, authentication.getName(), reason);
        return ResponseEntity.ok("Dispute opened");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Dispute> getAllDisputes() {
        return disputeService.getAllDisputes();
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveDispute(
            @PathVariable UUID id,
            @RequestParam boolean collectorWins,
            @RequestParam(required = false) String comment
    ) {
        disputeService.resolveDispute(id, collectorWins, comment);
        return ResponseEntity.ok("Dispute resolved");
    }
}