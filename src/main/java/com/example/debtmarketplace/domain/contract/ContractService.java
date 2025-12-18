package com.example.debtmarketplace.domain.contract;

import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.order.repository.OrderRepository;
import com.example.debtmarketplace.domain.profile.entity.CollectorProfile;
import com.example.debtmarketplace.domain.profile.entity.CustomerProfile;
import com.example.debtmarketplace.domain.profile.repository.CollectorProfileRepository;
import com.example.debtmarketplace.domain.profile.repository.CustomerProfileRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import com.lowagie.text.pdf.BaseFont;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final OrderRepository orderRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final CollectorProfileRepository collectorProfileRepository;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

    public byte[] generateContractPdf(java.util.UUID orderId) {
        // 1. Получаем данные
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String customerInfo = getCustomerInfo(order.getCustomerId());
        String collectorInfo = getCollectorInfo(order.getCollectorId());

        // 2. Заполняем контекст (переменные для HTML)
        Context context = new Context();
        context.setVariable("orderId", order.getId().toString());
        context.setVariable("date", order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE));
        context.setVariable("customerInfo", customerInfo);
        context.setVariable("collectorInfo", collectorInfo);
        context.setVariable("description", order.getDescription());
        context.setVariable("price", order.getPrice());

        // 3. Рендерим HTML
        String htmlContent = templateEngine.process("contract", context);

        // 4. Конвертируем в PDF
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private String getCustomerInfo(java.util.UUID userId) {
        return customerProfileRepository.findById(userId)
                .map(CustomerProfile::getCompanyName)
                .orElseGet(() -> getUserEmail(userId));
    }

    private String getCollectorInfo(java.util.UUID userId) {
        if (userId == null) return "NOT ASSIGNED";
        return collectorProfileRepository.findById(userId)
                .map(p -> "Collector (Region: " + p.getRegion() + ")")
                .orElseGet(() -> getUserEmail(userId));
    }

    private String getUserEmail(java.util.UUID userId) {
        return userRepository.findById(userId).map(User::getEmail).orElse("Unknown");
    }
}