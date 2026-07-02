package com.proyecto.dao;

// Importamos la conexión y el modelo que creamos antes
import com.proyecto.conexion.Conexion;
import com.proyecto.modelo.Foro;

// Importamos las herramientas de Java para ejecutar SQL
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ForoDAO {

    // =========================================================================
    // 1. CREATE (Crear / Insertar una nueva pregunta en el foro)
    // =========================================================================
    public boolean insertar(Foro foro) {
        // El comando SQL idéntico al que usarías en tu base de datos. 
        // Los signos de pregunta '?' son comodines que luego rellenaremos por seguridad.
        String sql = "INSERT INTO Foro (Titulo, descripcion, id_usuario) VALUES (?, ?, ?)";
        
        // El 'try-with-resources' abre la conexión automáticamente y la cierra al terminar para no saturar el servidor
        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            // Aquí cambiamos los '?' por los datos reales que vienen dentro de la caja 'Foro'
            ps.setString(1, foro.getTitulo());       // Primer '?' -> Titulo
            ps.setString(2, foro.getDescripcion());  // Segundo '?' -> Descripcion
            ps.setInt(3, foro.getIdUsuario());       // Tercer '?' -> id_usuario
            
            // ps.executeUpdate() ejecuta el comando en MySQL. Si guarda algo, devuelve un número mayor a 0.
            return ps.executeUpdate() > 0; 
            
        } catch (SQLException e) {
            System.out.println("Error al insertar en el foro: " + e.getMessage());
            return false;
        }
    }

    // =========================================================================
    // 2. READ (Leer / Consultar todas las preguntas del foro para mostrarlas en pantalla)
    // =========================================================================
    public List<Foro> listar() {
        // Creamos una lista vacía de Java para guardar todas las preguntas que encontremos
        List<Foro> lista = new ArrayList<>();
        String sql = "SELECT * FROM Foro";
        
        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) { // El ResultSet es como una tabla virtual con los resultados
            
            // Mientras haya filas en el resultado de la base de datos...
            while (rs.next()) {
                // Creamos una caja de Foro nueva para esta fila
                Foro foro = new Foro();
                // Sacamos los datos de la base de datos y los metemos en la caja de Java
                foro.setIdForo(rs.getInt("id_foro"));
                foro.setTitulo(rs.getString("Titulo"));
                foro.setDescripcion(rs.getString("descripcion"));
                foro.setFechaCreacion(rs.getDate("fecha_creacion"));
                foro.setIdUsuario(rs.getInt("id_usuario"));
                
                // Añadimos la caja llena a nuestra lista
                lista.add(foro);
            }
            
        } catch (SQLException e) {
            System.out.println("Error al listar el foro: " + e.getMessage());
        }
        
        return lista; // Devolvemos la lista con todas las preguntas encontradas
    }

    // =========================================================================
    // 3. UPDATE (Actualizar una pregunta existente)
    // =========================================================================
    public boolean actualizar(Foro foro) {
        String sql = "UPDATE Foro SET Titulo = ?, descripcion = ? WHERE id_foro = ?";
        
        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, foro.getTitulo());
            ps.setString(2, foro.getDescripcion());
            ps.setInt(3, foro.getIdForo()); // Le decimos cuál id_foro específico queremos modificar
            
            return ps.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.out.println("Error al actualizar el foro: " + e.getMessage());
            return false;
        }
    }

    // =========================================================================
    // 4. DELETE (Eliminar una pregunta del foro por su ID)
    // =========================================================================
    public boolean eliminar(int idForo) {
        String sql = "DELETE FROM Foro WHERE id_foro = ?";
        
        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, idForo);
            
            return ps.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.out.println("Error al eliminar del foro: " + e.getMessage());
            return false;
        }
    }

    public int obtenerUltimoId() {
        String sql = "SELECT MAX(id_foro) AS ultimo_id FROM Foro";
        try (Connection con = Conexion.conectar();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("ultimo_id");
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener último foro: " + e.getMessage());
        }
        return 0;
    }
}