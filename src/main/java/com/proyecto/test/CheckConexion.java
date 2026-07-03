package com.proyecto.test;

import com.proyecto.conexion.Conexion;
import java.sql.Connection;

public class CheckConexion {
    public static void main(String[] args) {
        try (Connection c = Conexion.conectar()) {
            System.out.println("Conectado OK: " + (c != null && !c.isClosed()));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
