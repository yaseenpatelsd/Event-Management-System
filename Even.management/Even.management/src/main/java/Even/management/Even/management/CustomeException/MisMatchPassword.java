package Even.management.Even.management.CustomeException;

public class MisMatchPassword extends RuntimeException{
    public MisMatchPassword(String message){
        super(message);
    }
}
