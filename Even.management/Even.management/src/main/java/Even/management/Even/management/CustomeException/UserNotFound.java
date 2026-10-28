package Even.management.Even.management.CustomeException;

public class UserNotFound extends RuntimeException{

    public UserNotFound(String message){
        super(message);
    }
}
