package presentation;
public class GuestController {
    private GuestService service;
    public GuestController()
    {
        this.service = new GuestService();
    }
    public void addGuest(String name, String email) {
        service.addGuest(name, email);
    }
    public void showAllGuests() {
        service.showAllGuests();
    }
}