package com.proyecto.modelo;

import java.sql.Date; // Importamos la herramienta para manejar fechas de SQL

public class Foro {
    
    // 1. Las "divisiones" de la caja (Atributos)
    // Tienen los mismos nombres de tus columnas en la base de datos
    private int idForo;
    private String titulo;
    private String descripcion;
    private Date fechaCreacion;
    private int idUsuario;

    // 2. El constructor vacío (Obligatorio en Java)
    // Es como crear la caja vacía de fábrica, lista para llenarse después
    public Foro() {
    }

    // 3. El constructor con parámetros
    // Sirve para crear la caja y llenarla con todos los datos de un solo golpe
    public Foro(int idForo, String titulo, String descripcion, Date fechaCreacion, int idUsuario) {
        this.idForo = idForo;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.idUsuario = idUsuario;
    }

    // 4. Los "Getters y Setters" (Los botones para sacar y meter datos)
    // Como las variables arriba son 'private' (protegidas), Java usa estos métodos públicos para interactuar con ellas.
    
    public int getIdForo() { return idForo; }
    public void setIdForo(int idForo) { this.idForo = idForo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}