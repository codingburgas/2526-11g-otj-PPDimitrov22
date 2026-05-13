package business;

import data.GuestRepository;
import model.Guest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GuestService {
    private final GuestRepository repo;
    public GuestService(GuestRepository repo) {
        this.repo = repo;
    }
    public Guest add(Guest guest) {
        return repo.save(guest);
    }
    public List<Guest> list() {
        return repo.findAll();
    }
}