package com.example.debtmarketplace.domain.finance.repository;

import com.example.debtmarketplace.domain.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    // Админ будет использовать findAll(), для фильтров можно добавить методы
}