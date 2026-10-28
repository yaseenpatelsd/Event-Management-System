package Even.management.Even.management.Util;

import Even.management.Even.management.Entity.UserEntity;
import Even.management.Even.management.Enum.Role;
import Even.management.Even.management.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;
@Component
public class AdminUsernameAndPasswordGenerator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsernameAndPasswordGenerator(UserRepository SAR, PasswordEncoder passwordEncoder) {
        this.userRepository = SAR ;
        this.passwordEncoder = passwordEncoder;
    }

    @Value("${admin.password}")
    private String password;

    @Value("${admin.username}")
    private String username;

    @Value("${admin.email}")
    private String email;


    @Override
    public void run(String... args) throws Exception {
        Optional<UserEntity> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            UserEntity admin = new UserEntity();

            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setEmail(email);
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
        }
    }
    }
