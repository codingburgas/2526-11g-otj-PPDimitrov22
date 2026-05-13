package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Reservation {
    @Id
    @GeneratedValue
    public Long id;
    public String guestName;
    public String room;

    public Reservation() {}
    public Reservation(String guestName, String room) {
        this.guestName = guestName;
        this.room = room;
    }
}