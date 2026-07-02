package com.royecto.controlador;

import com.proyecto.dao.ForoDAO;
import com.proyecto.dao.FotoDAO;
import com.proyecto.modelo.Foro;
import com.proyecto.modelo.Foto;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Timestamp;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet(name = "FotoServlet", urlPatterns = {"/FotoServlet"})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024,
    maxFileSize = 5 * 1024 * 1024,
    maxRequestSize = 10 * 1024 * 1024
)
public class FotoServlet extends HttpServlet {

    private static final String UPLOAD_DIRECTORY = "uploads";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String titulo = request.getParameter("titulo");
        String descripcion = request.getParameter("descripcion");
        Part archivo = request.getPart("archivo-adjunto");

        Foro foro = new Foro();
        foro.setTitulo(titulo);
        foro.setDescripcion(descripcion);
        foro.setIdUsuario(1);

        ForoDAO foroDAO = new ForoDAO();
        boolean foroGuardado = foroDAO.insertar(foro);

        int idForo = 0;
        if (foroGuardado) {
            idForo = foroDAO.obtenerUltimoId();
        }

        String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIRECTORY;
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String nombreArchivo = null;
        String rutaArchivo = null;
        String tipoContenido = null;

        if (archivo != null && archivo.getSize() > 0) {
            nombreArchivo = Paths.get(archivo.getSubmittedFileName()).getFileName().toString();
            tipoContenido = archivo.getContentType();
            rutaArchivo = UPLOAD_DIRECTORY + File.separator + nombreArchivo;
            Path destino = Paths.get(uploadPath, nombreArchivo);
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        }

        Foto foto = new Foto();
        foto.setNombreArchivo(nombreArchivo != null ? nombreArchivo : "");
        foto.setRutaArchivo(rutaArchivo != null ? rutaArchivo : "");
        foto.setTipoContenido(tipoContenido != null ? tipoContenido : "application/octet-stream");
        foto.setIdForo(idForo);
        foto.setIdUsuario(1);
        foto.setFechaSubida(new Timestamp(System.currentTimeMillis()));

        FotoDAO fotoDAO = new FotoDAO();
        boolean guardado = fotoDAO.insertar(foto);

        if (guardado) {
            response.sendRedirect("foro.html?status=success");
        } else {
            response.sendRedirect("foro.html?status=error");
        }
    }
}
