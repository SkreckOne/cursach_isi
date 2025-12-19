package com.example.debtmarketplace.service;

import com.example.debtmarketplace.domain.order.entity.Attachment;
import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.order.entity.OrderApplication;
import com.example.debtmarketplace.domain.order.repository.AttachmentRepository;
import com.example.debtmarketplace.domain.order.repository.OrderApplicationRepository;
import com.example.debtmarketplace.domain.order.repository.OrderRepository;
import com.example.debtmarketplace.domain.user.entity.User;
import com.example.debtmarketplace.domain.user.enums.UserRoleEnum;
import com.example.debtmarketplace.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.debtmarketplace.domain.order.dto.ApplicationDto;
import com.example.debtmarketplace.domain.order.entity.OrderApplication;
import com.example.debtmarketplace.domain.profile.entity.CollectorProfile;
import com.example.debtmarketplace.domain.profile.repository.CollectorProfileRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final OrderApplicationRepository orderApplicationRepository;
    private final CollectorProfileRepository collectorProfileRepository;

    public List<Order> getOrdersForUser(String email, String search) {
        User user = getUserByEmail(email);
        UserRoleEnum role = user.getRole().getName();

        List<Order> orders = new ArrayList<>();

        if (role == UserRoleEnum.admin) {
            orders = orderRepository.findAll();
        } else if (role == UserRoleEnum.customer) {
            orders = orderRepository.findAllByCustomerId(user.getId());
        } else if (role == UserRoleEnum.collector) {
            List<Order> marketplace = orderRepository.findAllByStatus("OPEN");
            List<Order> myWork = orderRepository.findAllByCollectorId(user.getId());
            orders.addAll(marketplace);
            orders.addAll(myWork);
        }

        orders.sort(Comparator.comparing(Order::getCreatedAt).reversed());

        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase().trim();
            return orders.stream()
                    .filter(o -> o.getDescription().toLowerCase().contains(query)
                            || o.getPrice().toString().contains(query))
                    .collect(Collectors.toList());
        }

        return orders;
    }

    @Transactional
    public void applyForOrder(UUID orderId, String email) {
        User collector = getUserByEmail(email);


        CollectorProfile profile = collectorProfileRepository.findById(collector.getId())
                .orElseThrow(() -> new RuntimeException("Please create your profile first!"));

        if (profile.getRegion() == null || profile.getRegion().isBlank() ||
                profile.getHourlyRate() == null || java.math.BigDecimal.ZERO.compareTo(profile.getHourlyRate()) >= 0) {
            throw new RuntimeException("Profile incomplete! Please fill Region and Rate in Profile.");
        }

        Order order = getOrder(orderId);
        if (!"OPEN".equals(order.getStatus())) throw new RuntimeException("Order not available");

        if (orderApplicationRepository.existsByOrderIdAndCollectorId(orderId, collector.getId())) {
            throw new RuntimeException("Already applied");
        }

        OrderApplication application = new OrderApplication();
        application.setOrder(order);
        application.setCollector(collector);
        orderApplicationRepository.save(application);
    }

    @Transactional
    public void approveCollector(UUID orderId, UUID collectorId, String customerEmail) {
        User customer = getUserByEmail(customerEmail);
        Order order = getOrder(orderId);

        if (!order.getCustomerId().equals(customer.getId())) {
            throw new RuntimeException("Not your order");
        }
        if (!"OPEN".equals(order.getStatus())) {
            throw new RuntimeException("Order is not open");
        }

        order.setCollectorId(collectorId);
        order.setStatus("IN_PROGRESS");
        orderRepository.save(order);

    }

    @Transactional
    public void withdrawApplication(UUID orderId, String email) {
        User collector = getUserByEmail(email);

        OrderApplication app = orderApplicationRepository.findByOrderIdAndCollectorId(orderId, collector.getId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        orderApplicationRepository.delete(app);
    }

    public List<UUID> getMyAppliedOrderIds(String email) {
        User collector = getUserByEmail(email);
        return orderApplicationRepository.findAllByCollectorId(collector.getId())
                .stream()
                .map(app -> app.getOrder().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteOrder(UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }
        orderRepository.deleteById(orderId);
    }

    public List<ApplicationDto> getApplicationsForOrder(UUID orderId) {
        List<OrderApplication> apps = orderApplicationRepository.findAllByOrderId(orderId);

        return apps.stream().map(app -> {
            ApplicationDto dto = new ApplicationDto();
            dto.setId(app.getId());
            dto.setCollectorId(app.getCollector().getId());
            dto.setEmail(app.getCollector().getEmail());
            dto.setAppliedAt(app.getCreatedAt());

            CollectorProfile profile = collectorProfileRepository.findById(app.getCollector().getId())
                    .orElse(new CollectorProfile());

            dto.setRating(profile.getAverageRating() != null ? profile.getAverageRating() : BigDecimal.ZERO);
            dto.setHourlyRate(profile.getHourlyRate());
            dto.setRegion(profile.getRegion());

            return dto;
        }).collect(Collectors.toList());
    }

    // 2. Создание
    @Transactional
    public Order createOrder(String email, String description, BigDecimal price, MultipartFile file) {
        User customer = getUserByEmail(email);


        String filePath = fileStorageService.uploadFile(file);

        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setDescription(description);
        order.setPrice(price);
        order.setStatus("PENDING_MODERATION");

        Order saved = orderRepository.save(order);

        Attachment attachment = new Attachment();
        attachment.setOrderId(saved.getId());
        attachment.setFilePath(filePath);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setUploadedById(customer.getId());
        attachmentRepository.save(attachment);

        return saved;
    }

    @Transactional
    public void moderateOrder(UUID orderId, boolean approved, String reason) {
        Order order = getOrder(orderId);
        if (!"PENDING_MODERATION".equals(order.getStatus())) throw new RuntimeException("Invalid status");

        if (approved) {
            order.setStatus("OPEN");
            order.setModerationComment(null);
        } else {
            order.setStatus("REJECTED");
            order.setModerationComment(reason);
        }
        orderRepository.save(order);
    }

    @Transactional
    public void takeOrder(UUID orderId, String email) {
        User collector = getUserByEmail(email);
        Order order = getOrder(orderId);

        if (!"OPEN".equals(order.getStatus())) throw new RuntimeException("Order not open");

        order.setCollectorId(collector.getId());
        order.setStatus("IN_PROGRESS");
        orderRepository.save(order);
    }

    @Transactional
    public void submitProof(UUID orderId, String email, String proofText, MultipartFile proofFile) {
        User collector = getUserByEmail(email);
        Order order = getOrder(orderId);

        if (!collector.getId().equals(order.getCollectorId())) throw new RuntimeException("Not your order");
        if (!"IN_PROGRESS".equals(order.getStatus())) throw new RuntimeException("Not in progress");

        String path = fileStorageService.uploadFile(proofFile);
        order.setProofDescription(proofText);
        order.setProofFilePath(path);
        order.setStatus("PENDING_REVIEW");
        orderRepository.save(order);
    }

    @Transactional
    public void approveCompletion(UUID orderId, String email) {
        User user = getUserByEmail(email);
        Order order = getOrder(orderId);

        if (user.getRole().getName() == UserRoleEnum.customer) {
            if (!order.getCustomerId().equals(user.getId())) {
                throw new RuntimeException("Access denied. You are not the customer for this order.");
            }
        }

        order.setStatus("completed");

        orderRepository.saveAndFlush(order);

        orderRepository.completeOrderAndProcessPayment(order.getId(), order.getCustomerId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
    private Order getOrder(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}