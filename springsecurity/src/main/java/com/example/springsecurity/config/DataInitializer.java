package com.example.springsecurity.config;

import com.example.springsecurity.entity.User;
import com.example.springsecurity.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * 起動時にサンプルユーザーを登録する。
 * 練習用の初期データ。
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("user").isEmpty()) {
            userRepository.save(new User(
                "user",
                passwordEncoder.encode("password"),
                Set.of("USER")
            ));
            System.out.println("サンプルユーザー登録: user / password");
        }
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(new User(
                "admin",
                passwordEncoder.encode("admin"),
                Set.of("USER", "ADMIN")
            ));
            System.out.println("サンプルユーザー登録: admin / admin");
        }
    }
}
