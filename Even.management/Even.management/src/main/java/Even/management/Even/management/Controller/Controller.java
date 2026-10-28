package Even.management.Even.management.Controller;

import Even.management.Even.management.Dto.LoginInput;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Dto.RegisterInputDto;
import Even.management.Even.management.Dto.TokenReturn;
import Even.management.Even.management.Service.EventRegisterService;
import Even.management.Even.management.Service.EventService;
import Even.management.Even.management.Service.RegisterService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class Controller {
    private final RegisterService registerService;
    private final EventService eventService;
    private final EventRegisterService eventRegisterService;

    public Controller(RegisterService registerService, EventService eventService, EventRegisterService eventRegisterService) {
        this.registerService = registerService;
        this.eventService = eventService;
        this.eventRegisterService = eventRegisterService;
    }


    @PostMapping("/register")
    public Output register(@RequestBody RegisterInputDto dto){
        Output output=registerService.register(dto);
        return output;
    }

    @PostMapping("/login")
public TokenReturn login(@RequestBody LoginInput dto) throws Exception {
        TokenReturn tokenReturn=registerService.logIn(dto);
        return tokenReturn;
}




}
