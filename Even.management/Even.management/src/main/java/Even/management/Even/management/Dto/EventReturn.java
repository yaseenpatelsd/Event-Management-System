package Even.management.Even.management.Dto;

import Even.management.Even.management.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventReturn {
    private int id;
    private String name;
    private LocalDate date;
    private String location;
    private String details;
    private Status status;
}
