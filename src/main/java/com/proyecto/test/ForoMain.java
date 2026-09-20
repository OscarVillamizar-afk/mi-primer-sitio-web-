package com.proyecto.test;

import com.proyecto.dao.ForoDAO;
import com.proyecto.modelo.Foro;

import java.util.List;

public class ForoMain {

    public static void main(String[] args) {
        ForoDAO dao = new ForoDAO();

        System.out.println("=== Prueba CRUD Foro (inicio) ===");

        // 1) Insertar
        Foro nuevo = new Foro();
        nuevo.setTitulo("Prueba Foro - insertar");
        nuevo.setDescripcion("Descripción de prueba desde ForoMain");
        nuevo.setIdUsuario(1);

        boolean okInsert = dao.insertar(nuevo);
        System.out.println("Insertar resultado: " + okInsert);

        // Obtener id del último insertado (si la tabla usa autoincrement)
        int ultimoId = dao.obtenerUltimoId();
        System.out.println("ID obtenido tras insertar: " + ultimoId);

        // 2) Listar y mostrar
        System.out.println("Lista actual de foros:");
        List<Foro> lista = dao.listar();
        lista.forEach(f -> System.out.println(formatForo(f)));

        // 3) Actualizar el que acabamos de insertar
        if (ultimoId > 0) {
            Foro aActualizar = new Foro();
            aActualizar.setIdForo(ultimoId);
            aActualizar.setTitulo("Prueba Foro - actualizado");
            aActualizar.setDescripcion("Descripción actualizada desde ForoMain");
            boolean okUpdate = dao.actualizar(aActualizar);
            System.out.println("Actualizar resultado: " + okUpdate);

            System.out.println("Registro tras actualización:");
            dao.listar().stream()
                .filter(f -> f.getIdForo() == ultimoId)
                .forEach(f -> System.out.println(formatForo(f)));
        } else {
            System.out.println("No se obtuvo un ID válido para actualizar.");
        }

        // 4) Eliminar
        if (ultimoId > 0) {
            boolean okDelete = dao.eliminar(ultimoId);
            System.out.println("Eliminar resultado (id=" + ultimoId + "): " + okDelete);
        }

        System.out.println("Lista final de foros:");
        dao.listar().forEach(f -> System.out.println(formatForo(f)));

        System.out.println("=== Prueba CRUD Foro (fin) ===");
    }

    private static String formatForo(Foro f) {
        return String.format("[id=%d] %s | %s | usuario=%d | fecha=%s",
                f.getIdForo(), f.getTitulo(), f.getDescripcion(), f.getIdUsuario(),
                f.getFechaCreacion());
    }
}
