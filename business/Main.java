package com.example.hotel.business;
import java.time.LocalDate;
public class Main {
    public static void main(String[] args) {

        HotelManager hotelManager = new HotelManager();

        System.out.println("===== ХОТЕЛСКА СИСТЕМА =====");

        System.out.println("\n--- Добавяне на гости ---");
        hotelManager.addGuest(new Guest(1, "Ivan Petrov", "ivan@example.com", "0888123456", "Sofia"));
        hotelManager.addGuest(new Guest(2, "Maria Georgieva", "maria@example.com", "0899123456", "Plovdiv"));
        hotelManager.addGuest(new Guest(3, "Petar Ivanov", "peter@example.com", "0877123456", "Varna"));

        System.out.println("\n--- Добавяне на стаи ---");
        hotelManager.addRoom(new Room(101, "Single", 50.0, 1));
        hotelManager.addRoom(new Room(102, "Double", 80.0, 2));
        hotelManager.addRoom(new Room(201, "Suite", 150.0, 4));
        hotelManager.addRoom(new Room(202, "Double", 90.0, 2));

        System.out.println("\n--- Добавяне на услуги ---");
        hotelManager.addService(new Service(1, "Breakfast", 8.0, "Закуска на бюфет"));
        hotelManager.addService(new Service(2, "Spa", 30.0, "Дневен достъп до SPA"));
        hotelManager.addService(new Service(3, "Airport Transfer", 25.0, "Трансфер от/до летището"));

        hotelManager.displayAllGuests();
        hotelManager.displayAllRooms();
        hotelManager.displayAllServices();

        System.out.println("\n--- Създаване на резервации ---");
        hotelManager.addReservation(new Reservation(1, 1, 101, LocalDate.now(), LocalDate.now().plusDays(2), 50.0));
        hotelManager.addReservation(new Reservation(2, 2, 102, LocalDate.now().plusDays(1), LocalDate.now().plusDays(4), 80.0));
        hotelManager.addReservation(new Reservation(3, 3, 201, LocalDate.now(), LocalDate.now().plusDays(1), 150.0));

        hotelManager.displayAllReservations();

        System.out.println("\n--- Генериране на фактури ---");
        hotelManager.createInvoice(1001, 1);
        hotelManager.createInvoice(1002, 2);
        hotelManager.createInvoice(1003, 3);

        System.out.println("\n--- Прилагане на отстъпка и данък ---");
        Invoice invoice1 = hotelManager.getInvoiceById(1001);
        if (invoice1 != null) {
            invoice1.applyDiscount(10);
            invoice1.addTax(5);
        }
        hotelManager.displayAllInvoices();

        System.out.println("\n--- Настаняване на гост ---");
        hotelManager.checkInGuest(1);

        System.out.println("\n--- Премахване на гост ---");
        hotelManager.checkOutGuest(1);

        System.out.println("\n--- Отмяна на резервация ---");
        hotelManager.cancelReservation(2);

        hotelManager.displayStatistics();

        System.out.println("\n===== НАЛИЧНИ СТАИ =====");
        for (Room room : hotelManager.getAvailableRooms()) {
            System.out.println("Стая #" + room.getRoomId() + " (" + room.getRoomType() + ") - " + room.getPricePerNight() + " лв/нощ");
        }
    }
}
