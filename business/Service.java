package com.example.hotel.business;

public class Service {
    private int serviceId;
    private String serviceName;
    private double price;
    private String description;

    public Service(int serviceId, String serviceName, double price, String description) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.price = price;
        this.description = description;
    }
    public int getServiceId() {
        return serviceId;
    }
    public String getServiceName() {
        return serviceName;
    }
    public double getPrice() {
        return price;
    }
    public String getDescription() {
        return description;
    }
    public void displayInfo() {
        System.out.println("Услуга: " + serviceName);
        System.out.println("Цена: " + price + " лв");
        System.out.println("Описание: " + description);
    }
}
