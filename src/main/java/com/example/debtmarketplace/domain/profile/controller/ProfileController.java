package com.example.debtmarketplace.domain.profile.controller;

import com.example.debtmarketplace.domain.profile.dto.CollectorProfileDto;
import com.example.debtmarketplace.domain.profile.dto.CustomerProfileDto;
import com.example.debtmarketplace.domain.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}