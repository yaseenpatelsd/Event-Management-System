package Even.management.Even.management.Repository;

import Even.management.Even.management.Entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity,Integer> {
}
