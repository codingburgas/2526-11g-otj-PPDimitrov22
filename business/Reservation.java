package com.example.hotel.business;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Reservation {
    private int reservationId;
    private int guestId;
    private int roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private double totalPrice;
    private String status;

    public Reservation(int reservationId, int guestId, int roomId, LocalDate checkInDate, LocalDate checkOutDate, double pricePerNight) {
        this.reservationId = reservationId;
        this.guestId = guestId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = "pending";
        calculateTotalPrice(pricePerNight);
    }
    private void calculateTotalPrice(double pricePerNight) {
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (nights < 0) nights = 0;
        this.totalPrice = nights * pricePerNight;
    }
    public int getReservationId() {
        return reservationId;
    }
    public int getGuestId() {
        return guestId;
    }
    public int getRoomId() {
        return roomId;
    }
    public LocalDate getCheckInDate() {
        return checkInDate;
    }
    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }
    public double getTotalPrice() {
        return totalPrice;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public void displayInfo() {
        System.out.println("Резервация #" + reservationId);
        System.out.println("Гост ID: " + guestId);
        System.out.println("Стая ID: " + roomId);
        System.out.println("Вход: " + checkInDate);
        System.out.println("Изход: " + checkOutDate);
        System.out.println("Обща цена: " + totalPrice + " €");
        System.out.println("Статус: " + status);
    }
}
