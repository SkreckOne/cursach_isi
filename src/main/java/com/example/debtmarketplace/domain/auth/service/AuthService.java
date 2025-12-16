package com.example.debtmarketplace.domain.auth.service;

import com.example.debtmarketplace.domain.auth.dto.JwtResponse;
import com.example.debtmarketplace.domain.auth.dto.LoginRequest;
import com.example.debtmarketplace.domain.auth.dto.RegisterRequest;
import com.example.debtmarketplace.domain.user.entity.Role;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import com.example.debtmarketplace.domain.user.repository.RoleRepository;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import com.example.debtmarketplace.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public String registerUser(RegisterRequest request) {
        // 1. Проверка существования Email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // 2. Определение роли (нечувствительно к регистру)
        UserRoleEnum roleEnum = Arrays.stream(UserRoleEnum.values())
                .filter(r -> r.name().equalsIgnoreCase(request.getRole()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Invalid role. Allowed: customer, collector"));

        // 3. Поиск роли в БД
        Role userRole = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new RuntimeException("Error: Role not found in database."));

        // 4. Создание пользователя
        // ВАЖНО: Мы НЕ вызываем .phone(), так как в таблице users нет этой колонки.
        // Если вы добавите колонку в БД (ALTER TABLE), раскомментируйте строку.
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                // .phone(request.getPhone())
                .role(userRole)
                .build();

        userRepository.save(user);

        return "User registered successfully!";
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        org.springframework.security.core.userdetails.User userSpring =
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        User user = userRepository.findByEmail(userSpring.getUsername()).orElseThrow();

        return new JwtResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getRole().getName().toString()
        );
    }
}