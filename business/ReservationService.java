package business;

import data.ReservationRepository;
import model.Reservation;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReservationService {
    private final ReservationRepository repo;
    public ReservationService(ReservationRepository repo) {
        this.repo = repo;
    }
    public Reservation add(Reservation reservation) {
        return repo.save(reservation);
    }
    public List<Reservation> list()
    {
        return repo.findAll();
    }
}