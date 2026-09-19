-- Esquema SQL corregido para TT&DT
-- Compatible con MariaDB/MySQL

CREATE TABLE Usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(250) NOT NULL,
    direccion VARCHAR(50) NOT NULL,
    fecha_registro DATE DEFAULT (CURRENT_DATE),
    codigo_postal VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    tipo_usuario VARCHAR(20),
    telefono VARCHAR(20),
    bio TEXT,
    foto_perfil VARCHAR(255),
    PRIMARY KEY (id_usuario),
    CONSTRAINT chk_tipo_usuario CHECK (tipo_usuario IN ('Dueno', 'Colaborador', 'Tecnico_moderador', 'Proveedor'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Categoria (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Producto (
    id_producto INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_producto),
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Imagen_producto (
    id_imagen INT NOT NULL AUTO_INCREMENT,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL UNIQUE,
    orden INT DEFAULT 1,
    PRIMARY KEY (id_imagen),
    CONSTRAINT fk_imagen_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Proveedor (
    id_proveedor INT NOT NULL AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100) NOT NULL UNIQUE,
    codigo_ciudad VARCHAR(50) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    nombre_contacto VARCHAR(100),
    PRIMARY KEY (id_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Foto (
    id_foto INT NOT NULL AUTO_INCREMENT,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_contenido VARCHAR(100) NOT NULL,
    id_foro INT NULL,
    id_usuario INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_foto),
    CONSTRAINT fk_foto_foro FOREIGN KEY (id_foro) REFERENCES Foro(id_foro),
    CONSTRAINT fk_foto_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Foro (
    id_foro INT NOT NULL AUTO_INCREMENT,
    Titulo VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion DATE DEFAULT (CURRENT_DATE),
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_foro),
    CONSTRAINT fk_foro_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Usuario_colaborador (
    id_colaborador INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nombre_negocio VARCHAR(100) NOT NULL UNIQUE,
    tipo_negocio VARCHAR(100) NOT NULL,
    comisiones_ventas DECIMAL(10,2) DEFAULT 0.00,
    PRIMARY KEY (id_colaborador),
    CONSTRAINT fk_colaborador_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Dueno (
    id_dueno INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    PRIMARY KEY (id_dueno),
    CONSTRAINT fk_dueno_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Inventario (
    id_inventario INT NOT NULL AUTO_INCREMENT,
    fecha_actualizacion DATE DEFAULT (CURRENT_DATE),
    id_usuario INT NOT NULL UNIQUE,
    observaciones TEXT,
    PRIMARY KEY (id_inventario),
    CONSTRAINT fk_inventario_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Detalle_inventario (
    id_detalle_inventario INT NOT NULL AUTO_INCREMENT,
    id_inventario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_detalle_inventario),
    CONSTRAINT fk_detalle_inventario_inventario
        FOREIGN KEY (id_inventario) REFERENCES Inventario(id_inventario),
    CONSTRAINT fk_detalle_inventario_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Compra (
    id_compra INT NOT NULL AUTO_INCREMENT,
    fecha_compra DATE DEFAULT (CURRENT_DATE),
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_compra),
    CONSTRAINT fk_compra_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Detalle_compra (
    id_detalle_compra INT NOT NULL AUTO_INCREMENT,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_detalle_compra),
    CONSTRAINT fk_detalle_compra_compra
        FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),
    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Factura (
    id_factura INT NOT NULL AUTO_INCREMENT,
    fecha_emision DATE DEFAULT (CURRENT_DATE),
    impuestos DECIMAL(10,2),
    costo_envio DECIMAL(10,2),
    total_final DECIMAL(10,2),
    id_compra INT NOT NULL UNIQUE,
    PRIMARY KEY (id_factura),
    CONSTRAINT fk_factura_compra
        FOREIGN KEY (id_compra) REFERENCES Compra(id_compra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Venta (
    id_venta INT NOT NULL AUTO_INCREMENT,
    fecha_venta DATE DEFAULT (CURRENT_DATE),
    estado VARCHAR(20) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    id_colaborador INT NULL,
    id_dueno INT NULL,
    id_compra INT NOT NULL UNIQUE,
    PRIMARY KEY (id_venta),
    CONSTRAINT chk_estado_venta CHECK (estado IN ('Pendiente', 'En espera', 'Completada', 'Cancelada')),
    CONSTRAINT chk_metodo_pago CHECK (metodo_pago IN ('Tarjeta de credito', 'Tarjeta de debito', 'Paypal', 'Transferencia bancaria', 'Efectivo')),
    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_venta_colaborador
        FOREIGN KEY (id_colaborador) REFERENCES Usuario_colaborador(id_colaborador),
    CONSTRAINT fk_venta_dueno
        FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno),
    CONSTRAINT fk_venta_compra
        FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),
    CONSTRAINT chk_vendedor_existente CHECK (id_dueno IS NOT NULL OR id_colaborador IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Detalle_venta (
    id_detalle_venta INT NOT NULL AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    precio DECIMAL(10,2),
    PRIMARY KEY (id_detalle_venta),
    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta) REFERENCES Venta(id_venta),
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Carrito (
    id_carrito INT NOT NULL AUTO_INCREMENT,
    fecha_creacion DATE DEFAULT (CURRENT_DATE),
    total DECIMAL(10,2) DEFAULT 0.00,
    id_usuario INT NOT NULL UNIQUE,
    PRIMARY KEY (id_carrito),
    CONSTRAINT fk_carrito_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Detalle_carrito (
    id_detalle_carrito INT NOT NULL AUTO_INCREMENT,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio DECIMAL(10,2) DEFAULT 0.00,
    PRIMARY KEY (id_detalle_carrito),
    CONSTRAINT fk_detalle_carrito_carrito
        FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
    CONSTRAINT fk_detalle_carrito_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Proveedor_producto (
    id_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_proveedor, id_producto),
    CONSTRAINT fk_proveedor_producto_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor),
    CONSTRAINT fk_proveedor_producto_producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Publicacion_foro (
    id_publicacion_foro INT NOT NULL AUTO_INCREMENT,
    id_foro INT NOT NULL,
    id_usuario INT NOT NULL,
    contenido TEXT,
    fecha_creacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado_reportado BOOLEAN DEFAULT FALSE,
    likes INT DEFAULT 0,
    PRIMARY KEY (id_publicacion_foro),
    CONSTRAINT fk_publicacion_foro_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_publicacion_foro_foro
        FOREIGN KEY (id_foro) REFERENCES Foro(id_foro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Informe_dueno (
    id_informe INT NOT NULL AUTO_INCREMENT,
    fecha_generacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    rango_fechas VARCHAR(50),
    metricas TEXT,
    formato VARCHAR(100),
    notas_analiticas TEXT,
    id_dueno INT NOT NULL,
    PRIMARY KEY (id_informe),
    CONSTRAINT fk_informe_dueno_dueno
        FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Tecnico_moderador (
    id_tecnico INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    celular VARCHAR(20),
    correo_empresa VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (id_tecnico),
    CONSTRAINT fk_tecnico_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Tarea (
    id_tarea INT NOT NULL AUTO_INCREMENT,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20),
    fecha_asignacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_limite DATE NOT NULL,
    id_dueno INT NOT NULL,
    id_tecnico INT NOT NULL,
    PRIMARY KEY (id_tarea),
    CONSTRAINT chk_estado_tarea CHECK (estado IN ('Pendiente', 'En proceso', 'Terminado')),
    CONSTRAINT fk_tarea_dueno
        FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno),
    CONSTRAINT fk_tarea_tecnico
        FOREIGN KEY (id_tecnico) REFERENCES Tecnico_moderador(id_tecnico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Incidencia_tecnica (
    id_incidencia INT NOT NULL AUTO_INCREMENT,
    id_usuario_reporto INT NOT NULL,
    fecha_reporte DATE DEFAULT (CURRENT_DATE),
    descripcion TEXT NOT NULL,
    pasos_reproducir TEXT,
    estado VARCHAR(20) DEFAULT 'Abierto',
    modulo_afectado VARCHAR(50),
    id_tecnico_asignado INT NOT NULL,
    PRIMARY KEY (id_incidencia),
    CONSTRAINT fk_incidencia_usuario
        FOREIGN KEY (id_usuario_reporto) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_incidencia_tecnico
        FOREIGN KEY (id_tecnico_asignado) REFERENCES Tecnico_moderador(id_tecnico),
    CONSTRAINT chk_estado_incidencia CHECK (estado IN ('Abierto', 'En revision', 'Resuelto', 'Cerrado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Prueba_automatizada (
    id_prueba INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    modulo_asociado VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_ejecucion DATE NOT NULL DEFAULT (CURRENT_DATE),
    resultado TEXT,
    es_critica BOOLEAN NOT NULL DEFAULT FALSE,
    id_tecnico INT NOT NULL,
    PRIMARY KEY (id_prueba),
    CONSTRAINT chk_estado_prueba CHECK (estado IN ('Realizada', 'Sin realizar', 'En proceso')),
    CONSTRAINT fk_prueba_tecnico
        FOREIGN KEY (id_tecnico) REFERENCES Tecnico_moderador(id_tecnico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Incidencia_prueba (
    id_incidencia INT NOT NULL,
    id_prueba INT NOT NULL,
    PRIMARY KEY (id_incidencia, id_prueba),
    CONSTRAINT fk_incidencia_prueba_incidencia
        FOREIGN KEY (id_incidencia) REFERENCES Incidencia_tecnica(id_incidencia),
    CONSTRAINT fk_incidencia_prueba_prueba
        FOREIGN KEY (id_prueba) REFERENCES Prueba_automatizada(id_prueba)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Mantenimiento (
    id_mantenimiento INT NOT NULL AUTO_INCREMENT,
    fecha DATE NOT NULL DEFAULT (CURRENT_DATE),
    modulos_revisados TEXT NOT NULL,
    actualizaciones_realizadas TEXT NOT NULL,
    errores_detectados TEXT,
    id_prueba INT NOT NULL,
    PRIMARY KEY (id_mantenimiento),
    CONSTRAINT fk_mantenimiento_prueba
        FOREIGN KEY (id_prueba) REFERENCES Prueba_automatizada(id_prueba)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Informe_mantenimiento (
    id_informe INT NOT NULL AUTO_INCREMENT,
    fecha_emision DATE NOT NULL DEFAULT (CURRENT_DATE),
    contenido_tecnico TEXT NOT NULL,
    tipo_archivo VARCHAR(20) DEFAULT 'PDF',
    recomendaciones TEXT,
    id_mantenimiento INT NOT NULL,
    PRIMARY KEY (id_informe),
    CONSTRAINT fk_informe_mantenimiento_mantenimiento
        FOREIGN KEY (id_mantenimiento) REFERENCES Mantenimiento(id_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Informe_rendimiento (
    id_informe INT NOT NULL AUTO_INCREMENT,
    metricas TEXT NOT NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_tecnico INT NOT NULL,
    id_dueno INT NOT NULL,
    PRIMARY KEY (id_informe),
    CONSTRAINT fk_informe_rendimiento_tecnico
        FOREIGN KEY (id_tecnico) REFERENCES Tecnico_moderador(id_tecnico),
    CONSTRAINT fk_informe_rendimiento_dueno
        FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
