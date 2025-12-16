package com.example.debtmarketplace.security;

import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Конвертируем нашего User в Spring Security User
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                !user.isBlocked(), // Enabled: вместо isActive() используем !isBlocked()
                true,              // Account Non Expired
                true,              // Credentials Non Expired
                !user.isBlocked(), // Account Non Locked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName().name().toUpperCase()))
        );
    }
}