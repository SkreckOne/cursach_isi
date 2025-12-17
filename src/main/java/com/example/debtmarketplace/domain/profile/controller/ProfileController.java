package com.example.debtmarketplace.domain.profile.controller;

import com.example.debtmarketplace.domain.profile.dto.CollectorProfileDto;
import com.example.debtmarketplace.domain.profile.dto.CustomerProfileDto;
import com.example.debtmarketplace.domain.profile.repository.CollectorProfileRepository;
import com.example.debtmarketplace.domain.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        // authentication.getName() возвращает email из токена
        return ResponseEntity.ok(profileService.getMyProfile(authentication.getName()));
    }

    @PutMapping("/collector")
    public ResponseEntity<?> updateCollectorProfile(Authentication authentication,
                                                    @RequestBody CollectorProfileDto dto) {
        profileService.updateCollectorProfile(authentication.getName(), dto);
        return ResponseEntity.ok("Collector profile updated");
    }

    @PutMapping("/customer")
    public ResponseEntity<?> updateCustomerProfile(Authentication authentication,
                                                   @RequestBody CustomerProfileDto dto) {
        profileService.updateCustomerProfile(authentication.getName(), dto);
        return ResponseEntity.ok("Customer profile updated");
    }

    @GetMapping("/methods")
    public ResponseEntity<?> getAllWorkMethods() {
        return ResponseEntity.ok(profileService.getAllWorkMethods());
    }

    @Autowired
    private CollectorProfileRepository collectorProfileRepository; // Добавить

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID userId) {
        // Ищем профиль коллектора. Если нет - профиль заказчика (или 404)
        return ResponseEntity.ok(collectorProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found")));
    }
}