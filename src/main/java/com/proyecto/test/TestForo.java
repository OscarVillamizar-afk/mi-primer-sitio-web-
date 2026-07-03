package com.proyecto.test;

import com.proyecto.dao.ForoDAO;
import com.proyecto.modelo.Foro;

public class TestForo {
    public static void main(String[] args) {
        // Intentar cargar explícitamente el driver JDBC primero
        try {
            Class.forName("org.mariadb.jdbc.Driver");
            System.out.println("Driver cargado manualmente OK");
        } catch (ClassNotFoundException e) {
            System.out.println("No se pudo cargar el driver manualmente: " + e.getMessage());
        }

        ForoDAO dao = new ForoDAO();
        System.out.println("Listando foros (cantidad): " + dao.listar().size());

        Foro f = new Foro();
        f.setTitulo("Prueba desde Test");
        f.setDescripcion("Descripción de prueba desde TestForo");
        f.setIdUsuario(1);

        boolean inserted = dao.insertar(f);
        System.out.println("Insertado: " + inserted);
    }
}
