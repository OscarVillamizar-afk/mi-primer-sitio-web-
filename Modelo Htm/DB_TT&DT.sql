-- Tabla de usuarios --
CREATE TABLE Usuario
(
    id_usuario                                        INT NOT NULL AUTO_INCREMENT,
    nombre                                            VARCHAR(50) NOT NULL,
    apellido                                          VARCHAR(50) NOT NULL,
    correo                                            VARCHAR(100) UNIQUE NOT NULL, 
    contrasena                                        VARCHAR(250) NOT NULL, 
    direccion                                         VARCHAR(50)  NOT NULL,
    fecha_registro                                    DATE, 
    codigo_postal                                     VARCHAR(20) NOT NULL, 
    fecha_nacimiento                                  DATE NOT NULL, 
    tipo_usuario                                      VARCHAR(20),
    
    PRIMARY KEY (id_usuario), 

    CONSTRAINT c_tipo_usuario CHECK(tipo_usuario IN ('Dueno', 'Colaborador', 'Tecnico_moderador', 'Proveedor'))
);



-- Tabla para categoria (productos) --
CREATE TABLE Categoria
(
    nombre                                        VARCHAR(50) NOT NULL,
    id_categoria                                  INT NOT NULL AUTO_INCREMENT, 
    descripcion                                    TEXT, 
    PRIMARY KEY (id_categoria)   
); 


-- Tabla productos --
CREATE TABLE Producto
(
    id_producto                                   INT NOT NULL AUTO_INCREMENT,
    nombre                                        VARCHAR(200) NOT NULL,
    descripcion                                   TEXT, 
    precio                                        DECIMAL(10,2) NOT NULL, 
    stock                                         INT NOT NULL DEFAULT 0, 
    id_categoria                                   INT NOT NULL, 

    PRIMARY KEY (id_producto), 

-- conexion con la tabla de categoria de productos -- 
    CONSTRAINT fk_categoria 
        FOREIGN KEY (id_categoria) 
        REFERENCES Categoria(id_categoria),

    CONSTRAINT chk_stock_positivo CHECK(stock >= 0 )
);


-- tabla de imegenes de los prodcutos---
CREATE TABLE Imagen_producto
(
    id_imagen                                    INT NOT NULL AUTO_INCREMENT, -- PK 
    id_producto                                  INT NOT NULL, -- FK
    url_imagen                                   VARCHAR(255) NOT NULL UNIQUE, 
    orden                                        INT DEFAULT  1, 

    PRIMARY KEY (id_imagen),

    CONSTRAINT fk_id_producto
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
);

-- tabla del proveedor --
CREATE TABLE Proveedor
(
    id_proveedor                                 INT NOT NULL AUTO_INCREMENT,
    nombre_proveedor                             VARCHAR(100) UNIQUE NOT NULL, 
    codigo_ciudad                                VARCHAR(50) NOT NULL, 
    direccion                                    VARCHAR(100) NOT NULL,
    telefono                                     VARCHAR(20) UNIQUE NOT NULL,
    nombre_contacto                              VARCHAR(100),

    PRIMARY KEY (id_proveedor)
);


-- Tabla del foro (foro de dibulgacion tenologica) --
CREATE TABLE Foro 
(
    id_foro                                     INT NOT NULL AUTO_INCREMENT,
    Titulo                                     VARCHAR(200) NOT NULL UNIQUE,
    descripcion                                 TEXT, 
    fecha_creacion                              DATE DEFAULT (CURRENT_DATE),
    id_usuario                                  INT NOT NULL, 

    PRIMARY KEY (id_foro),

    -- coneccion con la tabla de usuario 
    CONSTRAINT fk_autor_foro 
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
); 


--         vamos a definir las secundarias ----

-- tabla para el usuario colaborador 
CREATE TABLE Usuario_colaborador
(
    id_colaborador                            INT NOT NULL AUTO_INCREMENT, 
    id_usuario                                INT UNIQUE NOT NULL, 
    nombre_negocio                            VARCHAR(100) UNIQUE NOT NULL, 
    tipo_negocio                              VARCHAR(100) NOT NULL, 
    comisiones_ventas                         DECIMAL(10,2) DEFAULT 0, 

    PRIMARY KEY (id_colaborador), 

    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
); 


--  tabla para el duenno del sistema --
CREATE TABLE Dueno
(
    id_dueno                                  INT NOT NULL AUTO_INCREMENT, -- PK 
    id_usuario                                INT NOT NULL UNIQUE, -- FK 

    PRIMARY KEY (id_dueno), 

    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)


); 


-- tabla de inventario --- 
Create TABLE Inventario
(
    id_inventario                             INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha_actualizacion                       DATE DEFAULT (CURRENT_DATE), 
    id_usuario                                INT NOT NULL UNIQUE, -- FK 
    observaciones                             TEXT, 

    PRIMARY KEY (id_inventario),

    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) 

); 

-- TABLA DE DETALLE DE INVENTARIO -- 
CREATE TABLE Detalle_inventario
(
    id_detalle_inventario                      INT NOT NULL AUTO_INCREMENT, -- PK 
    id_inventario                              INT NOT NULL, -- FK 
    id_producto                                INT NOT NULL, -- FK 
    cantidad                                   INT NOT NULL, 

    PRIMARY KEY (id_detalle_inventario),

    CONSTRAINT fk_id_inventario 
        FOREIGN KEY (id_inventario)
        REFERENCES Inventario(id_inventario),
        
    CONSTRAINT fk_id_producto
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
);

-- tabla de compra --
CREATE TABLE Compra
(
    id_compra                                    INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha_compra                                 DATE DEFAULT (CURRENT_DATE), 
    id_usuario                                   INT NOT NULL,-- FK 

    PRIMARY KEY (id_compra), 

    CONSTRAINT fk_id_usuario 
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) 
);


-- tabla detalle compra -- 
CREATE TABLE Detalle_compra
(
    id_detalle_compra                             INT NOT NULL AUTO_INCREMENT, -- PK
    id_compra                                     INT NOT NULL, -- FK
    id_producto                                   INT NOT NULL, -- FK 
    cantidad                                      INT NOT NULL, 
    Precio                                        DECIMAL(10,2) NOT NULL, 

    PRIMARY KEY (id_detalle_compra), 

-- conexion con xompra para su id
    CONSTRAINT fk_id_compra 
        FOREIGN KEY (id_compra)
        REFERENCES Compra(id_compra), 

-- conceccion con prodcuto para su id 
    CONSTRAINT fk_id_producto
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
);

-- tabla de factura --- 
CREATE TABLE Factura
(
    id_factura                                     INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha_emision                                   DATE DEFAULT(CURRENT_DATE), 
    impuestos                                       DECIMAL(10,2), -- ennemos en cuent el  DECIMMAL  ya que queremos que nos cobren menos immpuestos jssjjsjs
    costo_envio                                     DECIMAL(10,2), 
    total_final                                     DECIMAL(10,2),
    id_compra                                       INT NOT NULL UNIQUE, -- FK 

    PRIMARY KEY (id_factura), 

    CONSTRAINT fk_id_compra
        FOREIGN KEY (id_compra)
        REFERENCES Compra(id_compra)
); 

-- tabla de venta 
CREATE TABLE Venta

(
    id_venta                                        INT NOT NULL AUTO_INCREMENT, -- PK
    fecha_venta                                     DATE DEFAULT (CURRENT_DATE),
    estado                                          VARCHAR(20) NOT NULL,  
    metodo_pago                                     VARCHAR(50) NOT NULL, 
    id_usuario                                      INT NOT NULL, -- FK comprador 

    id_colaborador                                  INT  NULL, -- FK vendedor
    id_dueno                                        INT  NULL, -- FK vendedor 

    id_compra                                       INT NOT NULL UNIQUE, -- FK 

    CONSTRAINT chk_estado CHECK(estado IN ('Pendiente', 'En espera', 'Completada', 'Cancelada')),

    CONSTRAINT chk_metodo_pago CHECK(metodo_pago IN ('Tarjeta de credito', 'Tarjeta de debito', 'Paypal', 'Transferencia bancaria', 'Efectivo')),

    PRIMARY KEY (id_venta),

-- relacion con el usuario que realizo la compra -- 
    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario),

    -- relacion son con el usuario colaborador -- 
    CONSTRAINT fk_id_colaborador
        FOREIGN KEY (id_colaborador)
        REFERENCES Usuario_colaborador(id_colaborador),

     -- relacion son con el usuario Dueno -- 
    CONSTRAINT fk_id_dueno
        FOREIGN KEY (id_dueno)
        REFERENCES Dueno(id_dueno),

         CONSTRAINT fk_id_compra                
        FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),

-- solo uno puede dender a la vez la reacione en el diagrama  debe ser 2:1 
    CONSTRAINT chk_vendedor_existente
        CHECK (id_dueno IS NOT NULL OR id_colaborador IS NOT NULL)
    
); 


-- tabla detalle venta  -- 
CREATE TABLE Detalle_venta
(
    id_detalle_venta                                 INT NOT NULL AUTO_INCREMENT, -- PK 
    id_venta                                         INT NOT NULL, -- FK
    id_producto                                       INT NOT NULL, -- FK 
    cantidad                                         INT NOT NULL DEFAULT 0, -- dato historico que puedde comabiar con el tiempo 
    precio                                           DECIMAL(10,2), 

    PRIMARY KEY (id_detalle_venta),

    CONSTRAINT fk_id_venta
        FOREIGN KEY (id_venta)
        REFERENCES Venta(id_venta),
    
    CONSTRAINT fk_id_producto
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
  
); 

-- tabla carrito de compras -- (ANTESALA DE L AVENTA)
CREATE TABLE Carrito
(
    id_carrito                                     INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha_creacion                                 DATE DEFAULT(CURRENT_DATE), 
    total                                          DECIMAL(10,2) DEFAULT 0.00 , 
    id_usuario                                     INT NOT NULL UNIQUE, -- FK UNIQUE PARA LA RELACION UNO A UNO 

    PRIMARY KEY (id_carrito), 

    -- relacion con el usuario que creo el carrito --
    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)

);

-- TABLA DE DETALLE DEL CARRITO
CREATE TABLE Detalle_carrito
(
    id_detalle_carrito                            INT NOT NULL AUTO_INCREMENT, -- PK
    id_carrito                                    INT NOT NULL, -- FK 
    id_producto                                   INT NOT NULL, -- FK 
    cantidad                                      INT NOT NULL DEFAULT 1, -- se muestra cuando el carrito ya se ha creado 
    precio                                        DECIMAL(10,2) DEFAULT 0.00, 

    PRIMARY KEY (id_detalle_carrito),

    -- relacion con el caarrito
    CONSTRAINT fk_id_carrito
        FOREIGN KEY (id_carrito)
        REFERENCES Carrito(id_carrito), 

    -- Relación con el producto real
    CONSTRAINT fk_id_producto_carrito
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
);

-- tabla del cpoveedor del prodcuto que concenta al proveedor con el producto 
CREATE TABLE Proveedor_producto
(
    id_proveedor                                INT NOT NULL, -- FK 
    id_producto                                  INT NOT NULL, -- FK 

    PRIMARY KEY (id_proveedor, id_producto),

    CONSTRAINT fk_id_proveedor 
        FOREIGN KEY (id_proveedor)
        REFERENCES Proveedor(id_proveedor), 

    CONSTRAINT fk_id_producto
        FOREIGN KEY (id_producto)
        REFERENCES Producto(id_producto)
); 

--- tabla para la creacion respuestas a foros -- 
CREATE TABLE Publicacion_foro
(
    id_publicacion_foro                         INT NOT NULL AUTO_INCREMENT, -- PK 
    id_foro                                     INT NOT NULL, -- FK 
    id_usuario                                  INT NOT NULL, -- FK
    contenido                                   TEXT, 
    fecha_creacion                              DATE NOT NULL DEFAULT(CURRENT_DATE), 
    estado_reportado                            BOOLEAN DEFAULT FALSE, 
    likes                                       INT DEFAULT 0, 

    PRIMARY KEY (id_publicacion_foro), 
    
    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario),

    CONSTRAINT fk_id_foro
        FOREIGN KEY (id_foro)
        REFERENCES Foro(id_foro)
        
);

-- tabla informe dueno-- 
CREATE TABLE Informe_dueno 
(
    id_informe                                 INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha_generacion                           DATE NOT NULL DEFAULT(CURRENT_DATE),
    rango_fechas                               VARCHAR(50), -- DEFINIMOS LOS MESES DE GENERACION DE LOS INFORMES
    metricas                                   TEXT, 
    formato                                    VARCHAR(100), 
    notas_analiticas                           TEXT, 
    id_dueno                                   INT NOT NULL, -- FK 

    -- LLAVE PRIMARIA 
    PRIMARY KEY (id_informe),

    -- relacion con el dueno del sistema
    CONSTRAINT fk_id_dueno
        FOREIGN KEY (id_dueno)
        REFERENCES Dueno(id_dueno) 

);

-- tabla tecnico moderador --
CREATE TABLE Tecnico_moderador
(
    id_tecnico                                 INT NOT NULL AUTO_INCREMENT, -- PK 
    id_usuario                                 INT NOT NULL, -- FK
    celular                                    VARCHAR(20), 
    correo_empresa                             VARCHAR(100) UNIQUE NOT NULL, 

    PRIMARY KEY (id_tecnico), 

    CONSTRAINT fk_id_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario)
); 

--- Tareas que que asigna el dueno a los moderadores --- 
CREATE TABLE Tarea
(
    id_tarea                                   INT NOT NULL AUTO_INCREMENT, -- PK 
    descripcion                                TEXT NOT NULL, 
    estado                                     VARCHAR(20), 
    fecha_asignacion                           DATE NOT NULL DEFAULT(CURRENT_DATE), 
    fecha_limite                               DATE NOT NULL, 
    id_dueno                                   INT NOT NULL, -- FK
    id_tecnico                                 INT NOT NULL, -- FK

    PRIMARY KEY (id_tarea), 

    CONSTRAINT chk_estado CHECK(estado IN('Pendiente', 'En proceso', 'Terminado') ), 

    CONSTRAINT fk_id_dueno
        FOREIGN KEY (id_dueno)
        REFERENCES Dueno(id_dueno), 

    CONSTRAINT fk_id_tecnico
        FOREIGN key (id_tecnico)
        REFERENCES Tecnico_moderador(id_tecnico)


); 

-- tabla de incidencias tecnicas --- 
CREATE TABLE Incidencia_tecnica
(
    id_incidencia                               INT NOT NULL AUTO_INCREMENT, -- PK 
    id_usuario_reporto                          INT NOT NULL, -- FK
    fecha_reporte                               DATE DEFAULT(CURRENT_DATE),
    descripcion                                 TEXT NOT NULL, 
    pasos_reproducir                            TEXT, -- LO QUE HIZO EL USUARIO
    estado                                      VARCHAR(20) DEFAULT 'Abierto',
    modulo_afectado                             VARCHAR(50), 
    id_tecnico_asignado                       INT NOT NULL, 

    PRIMARY KEY (id_incidencia), 

    CONSTRAINT fk_usuario_incidencia
        FOREIGN KEY (id_usuario_reporto)
        REFERENCES Usuario(id_usuario), 

    CONSTRAINT fk_tecnico_icidencia
        FOREIGN KEY (id_tecnico_asignado)
        REFERENCES Tecnico_moderador(id_tecnico),

    CONSTRAINT chk_estado_incidencia
    CHECK (estado IN('Abierto', 'En revision', 'Resuelto', 'Cerrado'))
);

--  tabla de prueba automatizada 
CREATE TABLE Prueba_automatizada 
(
    id_prueba                                 INT NOT NULL AUTO_INCREMENT, -- PK 
    nombre                                    VARCHAR(50) NOT NULL, 
    modulo_asociado                           VARCHAR(50) NOT NULL,
    estado                                    VARCHAR(50) NOT NULL, -- REALIZADA, SIN REALIZAR Y EN PROCESO, HACER UN CHECK
    fecha_ejecucion                           DATE DEFAULT(CURRENT_DATE) NOT NULL, 
    resultado                                 TEXT, -- OPCIONAL ASTA TENER LOS RESULTADOS DE LA PRUEBA
    es_critica                                BOOLEAN NOT NULL DEFAULT FALSE, 
    id_tecnico                                INT NOT NULL, -- FK 

    PRIMARY KEY (id_prueba), 

    CONSTRAINT chk_estado 
        CHECK(estado  IN('Realizada', 'Sin realizar', 'En proceso')), 

    CONSTRAINT fk_id_tecnico
        FOREIGN KEY (id_tecnico)
        REFERENCES Tecnico_moderador(id_tecnico) 
); 

---- TABLA CONEXION INCIDENCIA PRUEBA --- 
CREATE TABLE Incidencia_prueba
(
    id_incidencia                           INT NOT NULL, -- FK
    id_prueba                               INT NOT NULL, -- FK 

    PRIMARY KEY (id_incidencia, id_prueba),
 
    CONSTRAINT fk_incidencia 
        FOREIGN KEY (id_incidencia) 
        REFERENCES Incidencia_tecnica(id_incidencia),

    CONSTRAINT fk_prueba_puente
        FOREIGN KEY (id_prueba) 
        REFERENCES Prueba_automatizada(id_prueba)
); 

---- REDACTAR EN EL INFORME CRITERIOS PARA ERALOIZAR MANTENIMMIENTO

-- tabla mantenimineto --- 
CREATE TABLE Mantenimiento
(
    id_mantenimiento                         INT NOT NULL AUTO_INCREMENT, -- PK 
    fecha                                    DATE DEFAULT(CURRENT_DATE) NOT NULL, 
    modulos_revisados                        TEXT NOT NULL, 
    actualizaciones_realizadas               TEXT NOT NULL, 
    errores_detectados                       TEXT, 
    id_prueba                                INT NOT NULL, -- FK 

    PRIMARY KEY (id_mantenimiento), 

    CONSTRAINT fk_id_prueba 
        FOREIGN KEY (id_prueba)
        REFERENCES Prueba_automatizada(id_prueba)
); 

-- Tabla final: Documentación oficial de los mantenimientos realizados
CREATE TABLE Informe_mantenimiento
(
    id_informe          INT NOT NULL AUTO_INCREMENT, -- PK
    fecha_emision       DATE NOT NULL DEFAULT (CURRENT_DATE),
    contenido_tecnico   TEXT NOT NULL, -- Resumen detallado del trabajo
    tipo_archivo        VARCHAR(20) DEFAULT 'PDF', -- Formato en que se guarda
    recomendaciones     TEXT,          -- Sugerencias del técnico para el futuro
    id_mantenimiento    INT NOT NULL, -- FK: A qué proceso de mantenimiento pertenece

    PRIMARY KEY (id_informe),

    -- Relación 1:1 o 1:N con Mantenimiento
    CONSTRAINT fk_informe_mantenimiento
        FOREIGN KEY (id_mantenimiento)
        REFERENCES Mantenimiento(id_mantenimiento)
);

-- Tabla para evaluar el desempeño de los técnicos moderadores
CREATE TABLE Informe_rendimiento
(
    id_informe              INT NOT NULL AUTO_INCREMENT, -- PK
    metricas                TEXT NOT NULL, -- Ej: "Tareas completadas: 10, Tiempo promedio: 2h"
    fecha_evaluacion        DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_tecnico              INT NOT NULL, -- FK: ¿A quién estamos evaluando?
    id_dueno                INT NOT NULL, -- FK: ¿Quién firma la evaluación?

    PRIMARY KEY (id_informe),

    -- Relación con el técnico evaluado
    CONSTRAINT fk_rendimiento_tecnico
        FOREIGN KEY (id_tecnico)
        REFERENCES Tecnico_moderador(id_tecnico),

    -- Relación con el dueño que evalúa
    CONSTRAINT fk_rendimiento_dueno
        FOREIGN KEY (id_dueno)
        REFERENCES Dueno(id_dueno)
);