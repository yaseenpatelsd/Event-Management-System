package Even.management.Even.management.Service;

import Even.management.Even.management.CustomeException.GenericException;
import Even.management.Even.management.CustomeException.UserNotFound;
import Even.management.Even.management.Dto.EventRegisterReturnDto;
import Even.management.Even.management.Dto.EventReturn;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Entity.EventEntity;
import Even.management.Even.management.Entity.EventRegistration;
import Even.management.Even.management.Entity.UserEntity;
import Even.management.Even.management.Enum.Status;
import Even.management.Even.management.Repository.EvenRegisterRepository;
import Even.management.Even.management.Repository.EventRepository;
import Even.management.Even.management.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventRegisterService {
  private final EvenRegisterRepository eventRegisterRepository;
  private final EventRepository eventRepository;
  private final UserRepository userRepository;
    public EventRegisterService(EvenRegisterRepository eventRegisterRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.eventRegisterRepository = eventRegisterRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public List<String> getAllRegisteredNames(int eventId) {

        List<EventRegistration> registrations =
                eventRegisterRepository.findAllByEvent_Id(eventId);

        return registrations.stream()
                .map(registration ->
                        registration.getUser().getUsername())
                .toList();
    }

    public Output eventRegister(String username, int eventId) {

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFound("User Not Found"));

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new GenericException("Event not found"));

        if (event.getStatus() == Status.DILIST) {
            throw new GenericException("Can't register for this event");
        }

        if (eventRegisterRepository.existsByEvent_IdAndUser_Id(
                eventId, user.getId())) {
            throw new GenericException(
                    "You have already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);

        eventRegisterRepository.save(registration);

        return new  Output("register for event");

    }

    public List<EventReturn> eventReturns(String username){
        UserEntity user= userRepository.findByUsername(username)
                .orElseThrow(()-> new UserNotFound("NOT FOUND"));

        List<EventRegistration> eventRegistrations=eventRegisterRepository.findAllByUser_Id(user.getId());

        return eventRegistrations.stream()
                .map(entity -> {
                    EventReturn dto = new EventReturn();
                    dto.setId(entity.getId());
                    dto.setName(entity.getEvent().getName());
                    dto.setDate(entity.getEvent().getDate());
                    dto.setDetails(entity.getEvent().getDetails());
                    dto.setLocation(entity.getEvent().getLocation());
                    dto.setStatus(entity.getEvent().getStatus());
                    // Map other fields here...
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
