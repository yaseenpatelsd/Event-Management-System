package Even.management.Even.management.CustomeException;

public class UserDoesNotExist extends RuntimeException{
    public UserDoesNotExist(String message){
        super(message);
    }
}
