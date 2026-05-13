package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Guest {
    @Id
    @GeneratedValue
    public Long id;
    public String name;
    public String email;

    public Guest() {}
    public Guest(String name, String email) {
        this.name = name;
        this.email = email;
    }
}
