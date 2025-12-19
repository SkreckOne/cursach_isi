package com.example.debtmarketplace.domain.review.service;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.order.repository.OrderRepository;
import com.example.debtmarketplace.domain.review.dto.ReviewRequest;
import com.example.debtmarketplace.domain.review.entity.Review;
import com.example.debtmarketplace.domain.review.repository.ReviewRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReview(String email, ReviewRequest dto) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomerId().equals(customer.getId())) {
            throw new RuntimeException("You are not the owner of this order");
        }
        if (!"completed".equalsIgnoreCase(order.getStatus())) { // Проверка статуса (completed)
            throw new RuntimeException("Order is not completed yet");
        }
        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new RuntimeException("Review already exists for this order");
        }

        Review review = new Review();
        review.setOrder(order);
        review.setCustomer(customer);

        User collector = userRepository.findById(order.getCollectorId())
                .orElseThrow(() -> new RuntimeException("Collector not found"));
        review.setCollector(collector);

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        reviewRepository.save(review);

    }
}