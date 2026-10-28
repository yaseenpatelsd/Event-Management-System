package Even.management.Even.management.Service;

import Even.management.Even.management.CustomeException.GenericException;
import Even.management.Even.management.CustomeException.UserNotFound;
import Even.management.Even.management.Dto.EventInput;
import Even.management.Even.management.Dto.EventReturn;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Entity.EventEntity;
import Even.management.Even.management.Entity.UserEntity;
import Even.management.Even.management.Enum.Role;
import Even.management.Even.management.Enum.Status;
import Even.management.Even.management.Repository.EventRepository;
import Even.management.Even.management.Repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public EventReturn eventRegister(String username, EventInput dto){
        UserEntity user=userRepository.findByUsername(username)
                .orElseThrow(()-> new UserNotFound("User Not Found"));

        if (!user.getRole().equals(Role.ADMIN)){
            throw new GenericException("You are not the Admin");
        }
        EventEntity eventEntity=new EventEntity();

        eventEntity.setName(dto.getName());
        eventEntity.setDate(dto.getDate());
        eventEntity.setDetails(dto.getDetails());
        eventEntity.setLocation(dto.getLocation());
        eventEntity.setStatus(Status.ACTIVE);

        eventEntity.setUser(user);

        eventRepository.save(eventEntity);

        return new EventReturn(eventEntity.getId(),eventEntity.getName(), eventEntity.getDate(), eventEntity.getLocation(), eventEntity.getDetails(),eventEntity.getStatus());
    }

    public void statusChange(String username,int id){
        UserEntity user=userRepository.findByUsername(username)
                .orElseThrow(()-> new UserNotFound("User Not Found"));

        if (!user.getRole().equals(Role.ADMIN)){
            throw new GenericException("You are not the Admin");
        }

        EventEntity eventEntity=eventRepository.findById(id)
                .orElseThrow(()-> new GenericException("Event not found"));

        if (eventEntity.getStatus().equals(Status.DILIST)){
            throw new GenericException("Already diListed");
        }

        eventEntity.setStatus(Status.DILIST);

        eventRepository.save(eventEntity);
    }


    public void registerForEvent(String name, int id){

        EventEntity eventEntity=eventRepository.findById(id)
                .orElseThrow(()-> new GenericException("Event not found"));

        if (eventEntity.getStatus().equals(Status.DILIST)){
            throw new GenericException("Can't register for this event");
        }

        List<String> names = eventEntity.getRegisterNames();

        if (names == null) {
            names = new ArrayList<>();
        }

        names.add(name);
        eventEntity.setRegisterNames(names);
        eventRepository.save(eventEntity);
    }

    public List<EventReturn> eventReturns(){
        List<EventEntity> eventEntities=eventRepository.findAll();

        return eventEntities.stream()
                .map(entity -> {
                    EventReturn dto = new EventReturn();
                    dto.setId(entity.getId());
                    dto.setName(entity.getName());
                    dto.setDate(entity.getDate());
                    dto.setDetails(entity.getDetails());
                    dto.setLocation(entity.getLocation());
                    dto.setStatus(entity.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public EventReturn eventReturn(int id ){
        EventEntity eventEntity=eventRepository.findById(id)
                .orElseThrow(()-> new GenericException("Event not found"));

        return new EventReturn(eventEntity.getId(),eventEntity.getName(), eventEntity.getDate(),eventEntity.getLocation(), eventEntity.getDetails(),eventEntity.getStatus());
    }

    public Output deleteEvent(int id){
        EventEntity eventEntity=eventRepository.findById(id)
                .orElseThrow(()-> new GenericException("Event not found"));

        eventRepository.delete(eventEntity);

        return new Output("Event is deleted");
    }


}
