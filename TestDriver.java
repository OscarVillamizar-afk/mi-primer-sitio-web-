public class TestDriver {
    public static void main(String[] args) {
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            System.out.println("Driver org.mariadb.jdbc.Driver encontrado");
        } catch (ClassNotFoundException e) {
            System.out.println("No encontrado: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
