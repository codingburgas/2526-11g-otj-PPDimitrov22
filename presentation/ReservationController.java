package presentation;

import business.ReservationService;
import model.Reservation;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService service;
    public ReservationController(ReservationService service) {
        this.service = service;
    }
    @PostMapping
    public Reservation add(@RequestBody Reservation reservation)
    {
        return service.add(reservation);
    }
    @GetMapping
    public List<Reservation> list() {
        return service.list();
    }
}