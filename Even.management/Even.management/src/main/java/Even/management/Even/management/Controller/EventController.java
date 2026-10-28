package Even.management.Even.management.Controller;

import Even.management.Even.management.Dto.EventInput;
import Even.management.Even.management.Dto.EventReturn;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Service.EventService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/event")
public class EventController {
    private final EventService eventService;


    public EventController(EventService eventService) {
        this.eventService = eventService;
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public EventReturn eventRegister(Authentication authentication, @RequestBody EventInput dto){
        EventReturn eventReturn=eventService.eventRegister(authentication.getName(), dto);
        return eventReturn;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/status/change")
    public void statusChange(Authentication authentication, @RequestParam int id){
        eventService.statusChange(authentication.getName(),id);
    }

    @GetMapping("/all")
    public List<EventReturn> eventReturns(){
        List<EventReturn> returns =eventService.eventReturns();

        return returns;
    }

    @GetMapping("/{id}")
    public EventReturn eventReturn(@PathVariable int id){
        EventReturn eventReturn=eventService.eventReturn(id);
        return eventReturn;
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public Output deleteEvent(@PathVariable int id){
        Output output= eventService.deleteEvent(id);
        return output;
    }
}
