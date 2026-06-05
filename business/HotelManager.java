package com.example.hotel.business;

import java.util.ArrayList;

public class HotelManager {
    private ArrayList<Guest> guests;
    private ArrayList<Room> rooms;
    private ArrayList<Reservation> reservations;
    private ArrayList<Service> services;
    private ArrayList<Invoice> invoices;

    // Конструктор
    public HotelManager() {
        guests = new ArrayList<>();
        rooms = new ArrayList<>();
        reservations = new ArrayList<>();
        services = new ArrayList<Service>();
        invoices = new ArrayList<>();
    }
    public void addGuest(Guest guest) {
        guests.add(guest);
        System.out.println("Гост " + guest.getName() + " е регистриран успешно!");
    }
    public Guest getGuestById(int guestId) {
        for (Guest guest : guests) {
            if (guest.getGuestId() == guestId) {
                return guest;
            }
        }
        return null;
    }
    public void displayAllGuests() {
        System.out.println("\n===== ВСИЧКИ ГОСТИ =====");
        if (guests.isEmpty()) {
            System.out.println("Няма регистрирани гости.");
        } else {
            for (Guest guest : guests) {
                guest.displayInfo();
                System.out.println("-----------");
            }
        }
    }
    public void addRoom(Room room) {
        rooms.add(room);
        System.out.println("Стая #" + room.getRoomId() + " е добавена успешно!");
    }
    public Room getRoomById(int roomId) {
        for (Room room : rooms) {
            if (room.getRoomId() == roomId) {
                return room;
            }
        }
        return null;
    }
    public ArrayList<Room> getAvailableRooms() {
        ArrayList<Room> availableRooms = new ArrayList<>();
        for (Room room : rooms) {
            if (room.getStatus().equals("available")) {
                availableRooms.add(room);
            }
        }
        return availableRooms;
    }
    public void displayAllRooms() {
        System.out.println("\n===== ВСИЧКИ СТАИ =====");
        if (rooms.isEmpty()) {
            System.out.println("Няма добавени стаи.");
        } else {
            for (Room room : rooms) {
                room.displayInfo();
                System.out.println("-----------");
            }
        }
    }
    public void addReservation(Reservation reservation) {
        Room room = getRoomById(reservation.getRoomId());
        if (room != null && room.getStatus().equals("available")) {
            reservations.add(reservation);
            room.setStatus("occupied");
            System.out.println("Резервация #" + reservation.getReservationId() + " е създадена успешно!");
        } else {
            System.out.println("Стаята не е налична!");
        }
    }
    public Reservation getReservationById(int reservationId) {
        for (Reservation res : reservations) {
            if (res.getReservationId() == reservationId) {
                return res;
            }
        }
        return null;
    }
    public void checkInGuest(int reservationId) {
        Reservation res = getReservationById(reservationId);
        if (res != null) {
            res.setStatus("checked_in");
            System.out.println("Гост е настанен успешно! Резервация: " + reservationId);
        } else {
            System.out.println("Резервацията не е намерена!");
        }
    }
    public void checkOutGuest(int reservationId) {
        Reservation res = getReservationById(reservationId);
        if (res != null) {
            res.setStatus("checked_out");
            Room room = getRoomById(res.getRoomId());
            if (room != null) {
                room.setStatus("available");
            }
            System.out.println("Гост е отселен успешно! Резервация: " + reservationId);
        } else {
            System.out.println("Резервацията не е намерена!");
        }
    }
    public void cancelReservation(int reservationId) {
        Reservation res = getReservationById(reservationId);
        if (res != null) {
            res.setStatus("cancelled");
            Room room = getRoomById(res.getRoomId());
            if (room != null) {
                room.setStatus("available");
            }
            System.out.println("Резервация " + reservationId + " е отменена!");
        } else {
            System.out.println("Резервацията не е намерена!");
        }
    }
    public void displayAllReservations() {
        System.out.println("\n===== ВСИЧКИ РЕЗЕРВАЦИИ =====");
        if (reservations.isEmpty()) {
            System.out.println("Няма резервации.");
        } else {
            for (Reservation res : reservations) {
                res.displayInfo();
                System.out.println("-----------");
            }
        }
    }
    public void addService(Service service) {
        services.add(service);
        System.out.println("Услуга '" + service.getServiceName() + "' е добавена успешно!");
    }
    public Service getServiceById(int serviceId) {
        for (Service service : services) {
            if (service.getServiceId() == serviceId) {
                return service;
            }
        }
        return null;
    }
    public void displayAllServices() {
        System.out.println("\n===== ВСИЧКИ УСЛУГИ =====");
        if (services.isEmpty()) {
            System.out.println("Няма добавени услуги.");
        } else {
            for (Service service : services) {
                service.displayInfo();
                System.out.println("-----------");
            }
        }
    }
    public void createInvoice(int invoiceId, int reservationId) {
        Reservation res = getReservationById(reservationId);
        if (res != null) {
            Invoice invoice = new Invoice(invoiceId, reservationId, res.getTotalPrice());
            invoices.add(invoice);
            System.out.println("Фактура " + invoiceId + " е генирирана успешно!");
        } else {
            System.out.println("Резервацията не е намерена!");
        }
    }
    public Invoice getInvoiceById(int invoiceId) {
        for (Invoice inv : invoices) {
            if (inv.getInvoiceId() == invoiceId) {
                return inv;
            }
        }
        return null;
    }
    public void displayAllInvoices() {
        System.out.println("\n===== ВСИЧКИ ФАКТУРИ =====");
        if (invoices.isEmpty()) {
            System.out.println("Няма генерирани фактури.");
        } else {
            for (Invoice inv : invoices) {
                inv.displayInvoice();
            }
        }
    }
    public void displayStatistics() {
        System.out.println("\n===== СТАТИСТИКА =====");
        System.out.println("Общо гости: " + guests.size());
        System.out.println("Общо стаи: " + rooms.size());
        System.out.println("Налични стаи: " + getAvailableRooms().size());
        System.out.println("Общо резервации: " + reservations.size());
        System.out.println("Общо услуги: " + services.size());
        System.out.println("Генерирани фактури: " + invoices.size());
    }
}
