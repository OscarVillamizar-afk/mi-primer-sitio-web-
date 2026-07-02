package com.proyecto.dao;

import com.proyecto.conexion.Conexion;
import com.proyecto.modelo.Foto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class FotoDAO {

    public boolean insertar(Foto foto) {
        String sql = "INSERT INTO Foto (nombre_archivo, ruta_archivo, tipo_contenido, id_foro, id_usuario, fecha_subida) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, foto.getNombreArchivo());
            ps.setString(2, foto.getRutaArchivo());
            ps.setString(3, foto.getTipoContenido());
            ps.setInt(4, foto.getIdForo());
            ps.setInt(5, foto.getIdUsuario());
            ps.setTimestamp(6, foto.getFechaSubida() != null ? foto.getFechaSubida() : new Timestamp(System.currentTimeMillis()));

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar foto: " + e.getMessage());
            return false;
        }
    }

    public List<Foto> listarPorForo(int idForo) {
        List<Foto> fotos = new ArrayList<>();
        String sql = "SELECT * FROM Foto WHERE id_foro = ?";

        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idForo);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Foto foto = new Foto();
                    foto.setIdFoto(rs.getInt("id_foto"));
                    foto.setNombreArchivo(rs.getString("nombre_archivo"));
                    foto.setRutaArchivo(rs.getString("ruta_archivo"));
                    foto.setTipoContenido(rs.getString("tipo_contenido"));
                    foto.setIdForo(rs.getInt("id_foro"));
                    foto.setIdUsuario(rs.getInt("id_usuario"));
                    foto.setFechaSubida(rs.getTimestamp("fecha_subida"));
                    fotos.add(foto);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error al listar fotos: " + e.getMessage());
        }

        return fotos;
    }
}
