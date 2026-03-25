package business;

import java.util.ArrayList;
import java.util.List;

public class GuestService {

    private List<Guest> guests = new ArrayList<>();
    private int nextId = 1;

    public void addGuest(String name, String email) {
        Guest guest = new Guest(nextId, name, email);
        guests.add(guest);
        nextId++;
        System.out.println("The guest is added successfully!");
    }
    public void showAllGuests() {
        if (guests.isEmpty()) {
            System.out.println("There are no guests at the moment");
            return;
        }

        System.out.println("\n--- List of guests");
        for (Guest g : guests) {
            System.out.println(g);
        }
    }
}