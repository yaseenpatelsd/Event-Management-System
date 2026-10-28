package Even.management.Even.management.Controller;

import Even.management.Even.management.Dto.EventReturn;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Entity.EventRegistration;
import Even.management.Even.management.Service.EventRegisterService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/event/register")
public class EventRegisterController {

    private final EventRegisterService eventRegisterService;

    public EventRegisterController(EventRegisterService eventRegisterService) {
        this.eventRegisterService = eventRegisterService;
    }

    @PreAuthorize("/hasRole('USER')")
    @PostMapping("/{id}")
    public Output eventRegister(Authentication authentication, @PathVariable int id){
        Output output=eventRegisterService.eventRegister(authentication.getName(),id);
        return output;
    }

    @PreAuthorize("/hasRole('USER')")

    @GetMapping("/{id}")
    public List<String> getAllRegisteredNames(@PathVariable int id){
        List<String> names=eventRegisterService.getAllRegisteredNames(id);
        return names;
    }
    @GetMapping
    public List<EventReturn> eventReturns(Authentication authentication){
        List<EventReturn> eventReturns=eventRegisterService.eventReturns(authentication.getName());
        return eventReturns;
    }
}
