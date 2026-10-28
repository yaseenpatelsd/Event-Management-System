package Even.management.Even.management.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterInputDto {

    private String username;
    private String email;
    private String password;
    private String confirmPassword;
}
