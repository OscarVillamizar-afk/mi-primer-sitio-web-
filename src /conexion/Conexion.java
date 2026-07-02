package com.proyecto.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {

    private static final String DEFAULT_URL = "jdbc:mariadb://localhost:3306/ttdtdb?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";
    private static final String[] DRIVER_CLASS_NAMES = {
        "org.mariadb.jdbc.Driver",
        "com.mysql.cj.jdbc.Driver"
    };

    public static Connection conectar() throws SQLException {
        String url = System.getProperty("DB_URL", DEFAULT_URL);
        String user = System.getProperty("DB_USER", DEFAULT_USER);
        String password = System.getProperty("DB_PASSWORD", DEFAULT_PASSWORD);

        for (String driverClassName : DRIVER_CLASS_NAMES) {
            try {
                Class.forName(driverClassName);
                return DriverManager.getConnection(url, user, password);
            } catch (ClassNotFoundException ignored) {
                // Se intenta con el siguiente driver.
            } catch (SQLException e) {
                if (driverClassName.equals(DRIVER_CLASS_NAMES[DRIVER_CLASS_NAMES.length - 1])) {
                    throw e;
                }
            }
        }

        throw new SQLException("No se encontró un driver JDBC compatible para MySQL/MariaDB.");
    }

    public static void main(String[] args) {
        try (Connection con = conectar()) {
            if (con != null && !con.isClosed()) {
                System.out.println("Conexión exitosa a la base de datos.");
            }
        } catch (SQLException e) {
            System.err.println("No se pudo conectar a la base de datos: " + e.getMessage());
            System.exit(1);
        }
    }
}