package com.example.debtmarketplace.config;

import com.example.debtmarketplace.domain.user.entity.Role;
import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import com.example.debtmarketplace.domain.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        createRoleIfNotFound(UserRoleEnum.customer);
        createRoleIfNotFound(UserRoleEnum.collector);
        createRoleIfNotFound(UserRoleEnum.admin);
    }

    private void createRoleIfNotFound(UserRoleEnum roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("Auto-created role: " + roleName);
        }
    }
}