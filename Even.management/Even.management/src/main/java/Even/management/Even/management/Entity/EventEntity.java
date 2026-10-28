package Even.management.Even.management.Entity;

import Even.management.Even.management.Enum.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "event")
public class EventEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name",nullable = false)
    private String name;
    @Column(nullable = false)
    private LocalDate date;
    @Column(nullable = false)
    private String location;
    @Column(nullable = false)
    private String details;

    @Column(nullable = false)
    private Status status;

    private List<String> registerNames;



    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "event")
    private List<EventRegistration> registrations = new ArrayList<>();
    @PrePersist
    public void setCreatedAt(){
        this.createdAt=LocalDateTime.now();
    }
}
