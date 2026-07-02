package com.proyecto.controlador;

// Importamos el Modelo y el DAO que ya creamos
import com.proyecto.dao.ForoDAO;
import com.proyecto.modelo.Foro;

// Importamos las herramientas web que Java necesita (Servlets)
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// Esta etiqueta define la URL o dirección con la que tu JavaScript va a comunicarse
@WebServlet(name = "ForoServlet", urlPatterns = {"/ForoServlet"})
public class ForoServlet extends HttpServlet {

    // El método doPost se ejecuta cuando envías datos desde un formulario web (Método POST)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // 1. Configurar que la información acepte tildes y caracteres especiales
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        // 2. RECIBIR los datos que vienen desde las cajitas del HTML
        // El nombre dentro de las comillas debe coincidir exactamente con el atributo 'name' de tu HTML o la clave de tu JS
        String tituloWeb = request.getParameter("titulo");
        String descripcionWeb = request.getParameter("descripcion");
        
        // Como en tu base de datos 'id_usuario' es un número entero, lo convertimos de texto a número.
        // Nota: Para la prueba del SENA, podemos simular que el usuario con ID 1 es el que está publicando.
        int idUsuarioWeb = 1; 

        // 3. ARMAR LA CAJA (Crear el Objeto Modelo)
        Foro nuevoForo = new Foro();
        nuevoForo.setTitulo(tituloWeb);
        nuevoForo.setDescripcion(descripcionWeb);
        nuevoForo.setIdUsuario(idUsuarioWeb);

        // 4. HACER QUE EL DAO TRABAJE (Llamar al cocinero)
        ForoDAO foroDao = new ForoDAO();
        boolean guardadoExitoso = foroDao.insertar(nuevoForo);

        // 5. RESPONDERLE A LA PÁGINA WEB (JavaScript)
        // Le devolvemos una respuesta al navegador para que sepa si se guardó o no
        try (PrintWriter out = response.getWriter()) {
            if (guardadoExitoso) {
                // Devolvemos un mensaje en formato JSON indicando éxito
                out.print("{\"status\": \"success\", \"message\": \"Pregunta publicada correctamente en el foro\"}");
            } else {
                out.print("{\"status\": \"error\", \"message\": \"No se pudo guardar la pregunta en la base de datos\"}");
            }
        }
    }
}