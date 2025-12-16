package com.example.debtmarketplace.service;

// ИМПОРТЫ ИЗМЕНИЛИСЬ НА НОВЫЕ:
import com.example.debtmarketplace.domain.order.entity.Attachment;
import com.example.debtmarketplace.domain.order.entity.Order;
import com.example.debtmarketplace.domain.order.repository.AttachmentRepository;
import com.example.debtmarketplace.domain.order.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Cacheable("orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(rollbackFor = Exception.class)
    public Order createOrderWithAttachment(UUID customerId, String description, BigDecimal price, MultipartFile file) {
        String uploadedFileName = null;

        try {
            uploadedFileName = fileStorageService.uploadFile(file);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file, order not created.");
        }

        try {
            Order order = new Order();
            order.setCustomerId(customerId);
            order.setDescription(description);
            order.setPrice(price);
            order.setStatus("pending_confirmation");
            Order savedOrder = orderRepository.save(order);

            Attachment attachment = new Attachment();
            attachment.setOrderId(savedOrder.getId());
            attachment.setFilePath(uploadedFileName);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setUploadedById(customerId);
            attachmentRepository.save(attachment);

            return savedOrder;

        } catch (Exception e) {
            if (uploadedFileName != null) {
                fileStorageService.deleteFile(uploadedFileName);
            }
            throw e;
        }
    }
}