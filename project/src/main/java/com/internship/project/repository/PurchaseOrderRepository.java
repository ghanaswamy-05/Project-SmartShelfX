package com.internship.project.repository;

import com.internship.project.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByBuyerId(Long buyerId);
    List<PurchaseOrder> findByStatus(String status);
    List<PurchaseOrder> findByAutoTriggeredTrue();

    @Query("SELECT po FROM PurchaseOrder po WHERE po.product.id = :productId AND po.status IN ('PENDING', 'APPROVED')")
    List<PurchaseOrder> findActiveOrdersByProductId(Long productId);
}