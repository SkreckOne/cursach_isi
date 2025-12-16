package com.example.debtmarketplace.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Проверяем наличие заголовка Authorization и его формат
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Извлекаем токен
        jwt = authHeader.substring(7);
        try {
            userEmail = jwtTokenProvider.extractUsername(jwt);
        } catch (Exception e) {
            // Если токен невалиден или истек, просто продолжаем цепочку фильтров,
            // Spring Security сам вернет 403, если доступ к ресурсу требует аутентификации
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Если email есть и пользователь еще не аутентифицирован в контексте
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Загружаем пользователя из БД
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Проверяем валидность токена
            if (jwtTokenProvider.isTokenValid(jwt, userDetails)) {

                // Создаем объект аутентификации
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Устанавливаем пользователя в контекст Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}