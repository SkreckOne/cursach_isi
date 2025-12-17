package com.example.debtmarketplace.service;

import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.enums.VerificationStatus;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void verifyUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationStatus(VerificationStatus.verified);
        userRepository.save(user);
    }

    @Transactional
    public void blockUser(UUID userId, boolean isBlocked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(isBlocked);
        userRepository.save(user);
    }
}