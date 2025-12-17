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

    // 1. Получение заказов
    public List<Order> getOrdersForUser(String email, String search) {
        User user = getUserByEmail(email);
        UserRoleEnum role = user.getRole().getName();

        List<Order> orders = new ArrayList<>();

        // 1. Собираем заказы по ролям (как и было)
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

        // 2. Сортировка (новые сверху)
        orders.sort(Comparator.comparing(Order::getCreatedAt).reversed());

        // 3. НОВОЕ: Фильтрация по поисковому запросу (Java Stream)
        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase().trim();
            return orders.stream()
                    .filter(o -> o.getDescription().toLowerCase().contains(query)
                            || o.getPrice().toString().contains(query))
                    .collect(Collectors.toList());
        }

        return orders;
    }

    // --- НОВЫЙ МЕТОД: Откликнуться (Коллектор) ---
    @Transactional
    public void applyForOrder(UUID orderId, String email) {
        User collector = getUserByEmail(email);
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

    // --- НОВЫЙ МЕТОД: Выбрать исполнителя (Заказчик) ---
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

        // Опционально: можно удалить остальные заявки
    }

    @Transactional
    public void deleteOrder(UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }
        orderRepository.deleteById(orderId);
    }

    // --- НОВЫЙ МЕТОД: Получить список откликов (для Заказчика) ---
    public List<OrderApplication> getApplicationsForOrder(UUID orderId) {
        return orderApplicationRepository.findAllByOrderId(orderId);
    }

    // 2. Создание
    @Transactional
    public Order createOrder(String email, String description, BigDecimal price, MultipartFile file) {
        User customer = getUserByEmail(email);

        // ВАЖНО: Ваша процедура create_new_order требует сразу и customer, и collector.
        // Но для биржи коллектор неизвестен. Поэтому создаем через JPA стандартно.

        String filePath = fileStorageService.uploadFile(file);

        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setDescription(description);
        order.setPrice(price);
        order.setStatus("PENDING_MODERATION"); // Ждет админа

        Order saved = orderRepository.save(order);

        Attachment attachment = new Attachment();
        attachment.setOrderId(saved.getId());
        attachment.setFilePath(filePath);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setUploadedById(customer.getId());
        attachmentRepository.save(attachment);

        return saved;
    }

    // 3. Модерация (Админ)
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

    // 4. Взять заказ (Коллектор)
    @Transactional
    public void takeOrder(UUID orderId, String email) {
        User collector = getUserByEmail(email);
        Order order = getOrder(orderId);

        if (!"OPEN".equals(order.getStatus())) throw new RuntimeException("Order not open");

        order.setCollectorId(collector.getId());
        order.setStatus("IN_PROGRESS");
        orderRepository.save(order);
    }

    // 5. Сдать работу (Коллектор)
    @Transactional
    public void submitProof(UUID orderId, String email, String proofText, MultipartFile proofFile) {
        User collector = getUserByEmail(email);
        Order order = getOrder(orderId);

        if (!collector.getId().equals(order.getCollectorId())) throw new RuntimeException("Not your order");
        if (!"IN_PROGRESS".equals(order.getStatus())) throw new RuntimeException("Not in progress");

        String path = fileStorageService.uploadFile(proofFile);
        order.setProofDescription(proofText);
        order.setProofFilePath(path);
        order.setStatus("PENDING_REVIEW"); // Ждет подтверждения выполнения
        orderRepository.save(order);
    }

    // 6. Подтверждение и Оплата (Вызывает PL/pgSQL процедуру)
    @Transactional
    public void approveCompletion(UUID orderId, String email) {
        // 1. Получаем пользователя и заказ
        User user = getUserByEmail(email);
        Order order = getOrder(orderId);

        // 2. Валидация прав:
        // Если это Заказчик, он должен быть владельцем заказа.
        if (user.getRole().getName() == UserRoleEnum.customer) {
            if (!order.getCustomerId().equals(user.getId())) {
                throw new RuntimeException("Access denied. You are not the customer for this order.");
            }
        }
        // Админ может подтверждать любые заказы.

        // 3. Подготовка к вызову процедуры.
        // Процедура в SQL жестко требует, чтобы статус УЖЕ был 'completed'.
        // Поэтому мы меняем его здесь и принудительно отправляем в БД.

        // Важно: в процедуре проверка идет на нижний регистр 'completed'
        order.setStatus("completed");

        // saveAndFlush обязателен! Иначе Hibernate отложит UPDATE,
        // процедура запустится раньше и упадет с ошибкой "Order status is not completed".
        orderRepository.saveAndFlush(order);

        // 4. Вызов хранимой процедуры для проведения транзакций
        // Передаем ID заказа и ID заказчика (владельца), так как процедура сверяет их.
        orderRepository.completeOrderAndProcessPayment(order.getId(), order.getCustomerId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
    private Order getOrder(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}