package com.example.hotel.business;

public class Invoice {
    private int invoiceId;
    private int reservationId;
    private double basePrice;
    private double discount;
    private double tax;
    private double totalAmount;
    private String paymentStatus;

    public Invoice(int invoiceId, int reservationId, double basePrice) {
        this.invoiceId = invoiceId;
        this.reservationId = reservationId;
        this.basePrice = basePrice;
        this.discount = 0;
        this.tax = 0;
        this.paymentStatus = "pending";
        calculateTotal();
    }
    public void applyDiscount(double discountPercent) {
        this.discount = basePrice * (discountPercent / 100);
        calculateTotal();
    }
    public void addTax(double taxPercent) {
        this.tax = (basePrice - discount) * (taxPercent / 100);
        calculateTotal();
    }
    private void calculateTotal() {
        this.totalAmount = basePrice - discount + tax;
    }
    public int getInvoiceId() {
        return invoiceId;
    }
    public int getReservationId() {
        return reservationId;
    }
    public double getBasePrice() {
        return basePrice;
    }
    public double getDiscount() {
        return discount;
    }
    public double getTax() {
        return tax;
    }
    public double getTotalAmount() {
        return totalAmount;
    }
    public String getPaymentStatus() {
        return paymentStatus;
    }
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    public void displayInvoice() {
        System.out.println("\n========== ФАКТУРА ==========");
        System.out.println("Номер на фактура: " + invoiceId);
        System.out.println("Номер на резервация: " + reservationId);
        System.out.println("Базова цена: " + basePrice + " €");
        System.out.println("Отстъпка: " + discount + " €");
        System.out.println("Данък: " + tax + " €");
        System.out.println("ОБЩА СУМА: " + totalAmount + " €");
        System.out.println("Статус плащане: " + paymentStatus);
        System.out.println("===========================\n");
    }
}
