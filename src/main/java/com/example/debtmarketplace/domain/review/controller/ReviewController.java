package com.example.debtmarketplace.domain.review.controller;

import com.example.debtmarketplace.domain.review.dto.ReviewRequest;
import com.example.debtmarketplace.domain.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(Authentication authentication, @RequestBody @Valid ReviewRequest dto) {
        reviewService.createReview(authentication.getName(), dto);
        return ResponseEntity.ok("Review created successfully");
    }
}