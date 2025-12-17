package com.example.debtmarketplace.domain.profile.service;

import com.example.debtmarketplace.domain.profile.dto.CollectorProfileDto;
import com.example.debtmarketplace.domain.profile.dto.CustomerProfileDto;
import com.example.debtmarketplace.domain.profile.entity.CollectorProfile;
import com.example.debtmarketplace.domain.profile.entity.CustomerProfile;
import com.example.debtmarketplace.domain.profile.repository.CollectorProfileRepository;
import com.example.debtmarketplace.domain.profile.repository.CustomerProfileRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import com.example.debtmarketplace.domain.workmethod.entity.WorkMethod;
import com.example.debtmarketplace.domain.workmethod.repository.WorkMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CollectorProfileRepository collectorProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final WorkMethodRepository workMethodRepository;

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

        // 2. Обновляем методы работы (Таблица collector_work_methods)
        if (dto.getWorkMethodIds() != null) {
            List<WorkMethod> methods = workMethodRepository.findAllById(dto.getWorkMethodIds());
            user.setWorkMethods(new HashSet<>(methods));
            userRepository.save(user);
        }
    }

    public List<WorkMethod> getAllWorkMethods() {
        return workMethodRepository.findAll();
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

    // Методы для получения текущего профиля (чтобы отобразить на фронте)
    public Object getMyProfile(String email) {
        User user = getUserByEmail(email);
        String role = user.getRole().getName().name();

        if (role.equalsIgnoreCase("collector")) {
            return collectorProfileRepository.findById(user.getId()).orElse(null);
        } else {
            return customerProfileRepository.findById(user.getId()).orElse(null);
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}