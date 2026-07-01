package com.example.hotel.business;

public class Room {
    private int roomId;
    private String roomType;
    private double pricePerNight;
    private String status;
    private int capacity;

    public Room(int roomId, String roomType, double pricePerNight, int capacity) {
        this.roomId = roomId;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.status = "available";
    }
    public int getRoomId() {
        return roomId;
    }
    public String getRoomType() {
        return roomType;
    }
    public double getPricePerNight() {
        return pricePerNight;
    }
    public String getStatus() {
        return status;
    }
    public int getCapacity() {
        return capacity;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }
    public void displayInfo() {
        System.out.println("Стая #" + roomId + " - " + roomType);
        System.out.println("Цена за ноч: " + pricePerNight + " €");
        System.out.println("Капацитет: " + capacity + " лица");
        System.out.println("Статус: " + status);
    }
}
