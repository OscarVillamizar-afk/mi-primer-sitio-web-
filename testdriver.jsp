<%@ page import="java.sql.*" %>
<html>
<body>
<h2>Test Driver</h2>
<pre>
<%
    try {
        Class.forName("org.mariadb.jdbc.Driver");
        out.println("Driver cargado correctamente: org.mariadb.jdbc.Driver\n");

        String url = System.getProperty("DB_URL", System.getenv().getOrDefault("DB_URL", "jdbc:mariadb://localhost:3306/ttdtdb?serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true"));
        String user = System.getProperty("DB_USER", System.getenv().getOrDefault("DB_USER", "root"));
        String pass = System.getProperty("DB_PASSWORD", System.getenv().getOrDefault("DB_PASSWORD", ""));

        out.println("DB_URL=" + url);
        out.println("DB_USER=" + user);
        out.println("DB_PASSWORD=" + (pass.isEmpty() ? "<empty>" : "<set>"));
        out.println("ServletContext real path=" + application.getRealPath("/") + "\n");

        try (java.sql.Connection c = java.sql.DriverManager.getConnection(url, user, pass)) {
            out.println("Conexión JDBC exitosa: " + c);
        } catch (Throwable ex) {
            out.println("Error al conectar JDBC: " + ex);
            java.io.StringWriter sw2 = new java.io.StringWriter();
            ex.printStackTrace(new java.io.PrintWriter(sw2));
            out.println(sw2.toString());
        }

    } catch (Throwable t) {
        out.println("Error al cargar driver: " + t);
        java.io.StringWriter sw = new java.io.StringWriter();
        t.printStackTrace(new java.io.PrintWriter(sw));
        out.println(sw.toString());
    }
%>
</pre>
</body>
</html>
