package com.example.hotel.business;

public class Guest {
    private int guestId;
    private String name;
    private String email;
    private String phone;
    private String address;

    public Guest(int guestId, String name, String email, String phone, String address) {
        this.guestId = guestId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
    public int getGuestId() {
        return guestId;
    }
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
    public String getPhone() {
        return phone;
    }
    public String getAddress() {
        return address;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public void displayInfo() {
        System.out.println("Гост ID: " + guestId);
        System.out.println("Име: " + name);
        System.out.println("Имейл: " + email);
        System.out.println("Телефон: " + phone);
        System.out.println("Адрес: " + address);
    }
}
