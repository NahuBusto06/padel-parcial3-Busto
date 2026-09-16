USE PadelDB;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* ================================================================
       1. CANCHAS

       Si en tu tabla la columna se llama PrecioPorHora en lugar de
       PrecioHora, reemplazá ese nombre en el INSERT.
       ================================================================ */
    INSERT INTO Canchas (Nombre, PrecioHora)
    VALUES
        (N'Cancha 1 - Cristal', 28000.00),
        (N'Cancha 2 - Panorámica', 25000.00),
        (N'Cancha 3 - Césped azul', 22000.00);

    /* Recuperamos los identificadores sin asumir que serán 1, 2 y 3. */
    DECLARE @Cancha1 INT =
        (SELECT IdCancha FROM Canchas WHERE Nombre = N'Cancha 1 - Cristal');

    DECLARE @Cancha2 INT =
        (SELECT IdCancha FROM Canchas WHERE Nombre = N'Cancha 2 - Panorámica');

    /* ================================================================
       2. RESERVAS

       Se cargan ocho reservas distribuidas entre hoy, mañana y pasado.
       Hay reservas pagadas (1) y pendientes (0).

       La Cancha 3 queda sin reservas intencionalmente. Esto permite
       comprobar que usp_RecaudacionPorCancha la muestre igualmente,
       con cantidad y totales en cero.
       ================================================================ */
    INSERT INTO Reservas (IdCancha, Cliente, Fecha, Hora, Pagada)
    VALUES
        -- Reservas de hoy.
        (@Cancha1, N'Martín López',
            CAST(GETDATE() AS DATE), N'18:00', 1),

        (@Cancha1, N'Carolina Gómez',
            CAST(GETDATE() AS DATE), N'19:00', 0),

        (@Cancha2, N'Federico Ruiz',
            CAST(GETDATE() AS DATE), N'20:00', 1),

        -- Reservas de mañana.
        (@Cancha1, N'Luciana Fernández',
            CAST(DATEADD(DAY, 1, GETDATE()) AS DATE), N'17:00', 0),

        (@Cancha2, N'Gonzalo Pérez',
            CAST(DATEADD(DAY, 1, GETDATE()) AS DATE), N'18:00', 1),

        (@Cancha2, N'Sofía Martínez',
            CAST(DATEADD(DAY, 1, GETDATE()) AS DATE), N'21:00', 0),

        -- Reservas de pasado mañana.
        (@Cancha1, N'Diego Sánchez',
            CAST(DATEADD(DAY, 2, GETDATE()) AS DATE), N'19:30', 1),

        (@Cancha2, N'Valentina Castro',
            CAST(DATEADD(DAY, 2, GETDATE()) AS DATE), N'20:30', 0);

    COMMIT TRANSACTION;

    PRINT N'Datos de prueba cargados correctamente.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

/* ================================================================
   VERIFICACIÓN OPCIONAL
   ================================================================ */
SELECT
    IdCancha,
    Nombre,
    PrecioHora
FROM Canchas
ORDER BY IdCancha;

SELECT
    r.IdReserva,
    c.Nombre AS Cancha,
    r.Cliente,
    r.Fecha,
    r.Hora,
    r.Pagada,
    c.PrecioHora
FROM Reservas AS r
INNER JOIN Canchas AS c
    ON c.IdCancha = r.IdCancha
ORDER BY r.Fecha, r.Hora;
GO
