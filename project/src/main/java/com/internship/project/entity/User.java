package com.internship.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "users")
@AllArgsConstructor
@RequiredArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String companyName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String contactNumber;
    private String warehouseLocation;

    // For Store Manager - specific warehouse assignment
    private String assignedWarehouse;

    public enum Role {
        USER, ADMIN, STORE_MANAGER, BUYER  // ADD BUYER ROLE
    }
}