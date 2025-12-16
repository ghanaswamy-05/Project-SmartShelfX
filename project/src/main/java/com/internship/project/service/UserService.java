package com.internship.project.service;

import com.internship.project.entity.User;
import com.internship.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User signup(User user) {
        return userRepository.save(user);
    }

    public boolean login(String email, String password) {
        Optional<User> existingOpt = userRepository.findByEmail(email);
        if (existingOpt.isEmpty()) return false;

        User existing = existingOpt.get();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(password, existing.getPassword());
    }

}
