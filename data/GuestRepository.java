package data;
import java.util.ArrayList;
import java.util.List;

public class GuestRepository
{
    private List<Guest> guests = new ArrayList<>();
    public void save(Guest guest) {
        guests.add(guest);
    }
    public List<Guest> getAll() {
        return guests;
    }
}