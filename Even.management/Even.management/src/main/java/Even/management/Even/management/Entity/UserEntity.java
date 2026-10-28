package Even.management.Even.management.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "user")
public class UserEntity {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private int id;

    @Column( nullable = false,unique = true)
    private String username;

    @Column(nullable = false , unique = true)
    private String email;


    @Column( nullable = false)
    private String password;



    @Column( nullable = false)
    private Enum role;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<EventEntity> events;

    @OneToMany(mappedBy = "user")
    private List<EventRegistration> eventRegistrations = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }


}
