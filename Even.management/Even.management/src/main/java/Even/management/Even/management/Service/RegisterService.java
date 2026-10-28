package Even.management.Even.management.Service;

import Even.management.Even.management.CustomeException.GenericException;
import Even.management.Even.management.CustomeException.MisMatchPassword;
import Even.management.Even.management.CustomeException.UserAlreadySIgnUp;
import Even.management.Even.management.CustomeException.UserDoesNotExist;
import Even.management.Even.management.Dto.LoginInput;
import Even.management.Even.management.Dto.Output;
import Even.management.Even.management.Dto.RegisterInputDto;
import Even.management.Even.management.Dto.TokenReturn;
import Even.management.Even.management.Entity.UserEntity;
import Even.management.Even.management.Enum.Role;
import Even.management.Even.management.Jwt.JwtGenerator;
import Even.management.Even.management.Repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtGenerator jwtGenerator;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtGenerator jwtGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtGenerator = jwtGenerator;
    }

    public Output register(RegisterInputDto dto){
        boolean isRegister=userRepository.existsByUsername(dto.getUsername());
        if (isRegister){
        throw new UserAlreadySIgnUp("You Have A Account Already Please Sign Up");
        }

        if (!dto.getPassword().equals(dto.getConfirmPassword())){
            throw new MisMatchPassword("Password and Confirm Password is not same ");
        }

        UserEntity user=new UserEntity();

        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);
        user.setEmail(dto.getEmail());

        userRepository.save(user);

        return new Output("Register Successfully");
    }

    public TokenReturn logIn(LoginInput dto) throws Exception {

        UserEntity user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new UserDoesNotExist("User Does Not Exist"));

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(dto.getUsername(),dto.getPassword()));
        } catch (Exception ex) {
            throw new GenericException(String.valueOf(ex));
        }


        String token=jwtGenerator.tokenGenerate(user.getUsername());

        return new TokenReturn(token);
    }

}
