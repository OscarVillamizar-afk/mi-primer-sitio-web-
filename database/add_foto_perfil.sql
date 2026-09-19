-- Ejecutar conectado a la base de datos db_final_ttdt
-- Añade la ruta de la foto de perfil sin duplicar la columna si ya existe.

SET @columna_existe = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuario'
      AND COLUMN_NAME = 'foto_perfil'
);

SET @sentencia = IF(
    @columna_existe = 0,
    'ALTER TABLE usuario ADD COLUMN foto_perfil VARCHAR(255) NULL',
    'SELECT 1'
);

PREPARE agregar_foto_perfil FROM @sentencia;
EXECUTE agregar_foto_perfil;
DEALLOCATE PREPARE agregar_foto_perfil;

DESCRIBE usuario;
