package com.example.debtmarketplace.domain.profile.service;

import com.example.debtmarketplace.domain.profile.dto.CollectorProfileDto;
import com.example.debtmarketplace.domain.profile.dto.CustomerProfileDto;
import com.example.debtmarketplace.domain.profile.entity.CollectorProfile;
import com.example.debtmarketplace.domain.profile.entity.CustomerProfile;
import com.example.debtmarketplace.domain.profile.repository.CollectorProfileRepository;
import com.example.debtmarketplace.domain.profile.repository.CustomerProfileRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import com.example.debtmarketplace.domain.workmethod.entity.WorkMethod;
import com.example.debtmarketplace.domain.workmethod.repository.WorkMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CollectorProfileRepository collectorProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final WorkMethodRepository workMethodRepository;

    // --- ОБНОВЛЕННЫЙ МЕТОД ПОЛУЧЕНИЯ ПРОФИЛЯ ---
    public Object getMyProfile(String email) {
        User user = getUserByEmail(email);
        UserRoleEnum role = user.getRole().getName();

        if (role == UserRoleEnum.collector) {
            // 1. Получаем профиль из базы (или пустой, если нет)
            CollectorProfile profile = collectorProfileRepository.findById(user.getId())
                    .orElse(new CollectorProfile());

            // 2. Маппим в DTO
            CollectorProfileDto dto = new CollectorProfileDto();
            dto.setDescription(profile.getDescription());
            dto.setHourlyRate(profile.getHourlyRate());
            dto.setRegion(profile.getRegion());

            // 3. Достаем методы работы из User и превращаем в список ID
            if (user.getWorkMethods() != null) {
                List<java.util.UUID> methodIds = user.getWorkMethods().stream()
                        .map(WorkMethod::getId)
                        .collect(Collectors.toList());
                dto.setWorkMethodIds(methodIds);
            }

            return dto;
        } else {
            // Для заказчика возвращаем сущность как есть (или можно тоже сделать DTO)
            return customerProfileRepository.findById(user.getId()).orElse(null);
        }
    }

    @Transactional
    public void updateCollectorProfile(String email, CollectorProfileDto dto) {
        User user = getUserByEmail(email);

        // 1. Обновляем таблицу профиля
        CollectorProfile profile = collectorProfileRepository.findById(user.getId())
                .orElse(new CollectorProfile());

        profile.setUser(user);
        profile.setDescription(dto.getDescription());
        profile.setHourlyRate(dto.getHourlyRate());
        profile.setRegion(dto.getRegion());

        collectorProfileRepository.save(profile);

        // 2. Обновляем методы работы
        if (dto.getWorkMethodIds() != null) {
            List<WorkMethod> methods = workMethodRepository.findAllById(dto.getWorkMethodIds());

            // Важно: инициализируем сет, если он null (хотя в User он обычно new HashSet<>())
            if (user.getWorkMethods() == null) {
                user.setWorkMethods(new HashSet<>());
            }

            user.getWorkMethods().clear();
            user.getWorkMethods().addAll(methods);
            userRepository.save(user);
        }
    }

    @Transactional
    public void updateCustomerProfile(String email, CustomerProfileDto dto) {
        User user = getUserByEmail(email);

        CustomerProfile profile = customerProfileRepository.findById(user.getId())
                .orElse(new CustomerProfile());

        profile.setUser(user);
        profile.setCompanyName(dto.getCompanyName());
        profile.setInn(dto.getInn());

        customerProfileRepository.save(profile);
    }

    public List<WorkMethod> getAllWorkMethods() {
        return workMethodRepository.findAll();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}