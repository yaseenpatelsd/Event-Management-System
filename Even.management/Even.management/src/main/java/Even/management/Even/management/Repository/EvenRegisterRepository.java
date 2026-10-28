package Even.management.Even.management.Repository;

import Even.management.Even.management.Entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvenRegisterRepository extends JpaRepository<EventRegistration,Integer> {
    Optional<EventRegistration> findByEventId(int id);
    boolean existsByEvent_IdAndUser_Id(int eventId,int userId);
    List<EventRegistration> findAllByEvent_Id(int eventId);
    List<EventRegistration> findAllByUser_Id(int userId);
}
