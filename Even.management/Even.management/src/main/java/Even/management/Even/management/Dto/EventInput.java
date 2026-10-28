package Even.management.Even.management.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EventInput {

    private String name;
    private LocalDate date;
    private String location;
    private String details;

}
