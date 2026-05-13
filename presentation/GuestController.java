package presentation;

import business.GuestService;
import model.Guest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/guests")
public class GuestController {
    private final GuestService service;
    public GuestController(GuestService service) {
        this.service = service;
    }
    @PostMapping
    public Guest add(@RequestBody Guest guest) {
        return service.add(guest);
    }
    @GetMapping
    public List<Guest> list() {
        return service.list();
    }
}