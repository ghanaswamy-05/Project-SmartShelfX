package com.internship.project.repository;

import com.internship.project.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.nio.file.LinkOption;

public interface EmployeeRepository extends JpaRepository<Employee,Long> {
}
