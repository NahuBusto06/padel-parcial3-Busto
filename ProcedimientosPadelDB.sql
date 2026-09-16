/* ==================================================================
   PadelDB - Sección B: Procedimientos almacenados
   (Compatible con SQL Server 2014: DROP + CREATE, sin CREATE OR ALTER)
   ================================================================== */
USE PadelDB;
GO

/* ------------------------------------------------------------------
   6. usp_ListarCanchas
      Id, nombre y precio por hora de cada cancha.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.usp_ListarCanchas', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ListarCanchas;
GO

CREATE PROCEDURE dbo.usp_ListarCanchas
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdCancha,
        Nombre,
        PrecioPorHora
    FROM Canchas
    ORDER BY IdCancha;
END
GO

/* ------------------------------------------------------------------
   7. usp_ListarReservas
      Reservas con el nombre y precio de su cancha (JOIN),
      ordenadas por fecha y hora.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.usp_ListarReservas', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_ListarReservas;
GO

CREATE PROCEDURE dbo.usp_ListarReservas
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.IdReserva,
        r.IdCancha,
        c.Nombre        AS Cancha,
        c.PrecioPorHora,
        r.Cliente,
        r.Fecha,
        r.Hora,
        r.Pagada
    FROM Reservas AS r
    INNER JOIN Canchas AS c
        ON c.IdCancha = r.IdCancha
    ORDER BY r.Fecha, r.Hora;
END
GO

/* ------------------------------------------------------------------
   8. usp_CrearReserva
      Valida: cliente no vacío (50003), cancha existente (50002)
      y horario libre (50011). Inserta y devuelve el id creado.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.usp_CrearReserva', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_CrearReserva;
GO

CREATE PROCEDURE dbo.usp_CrearReserva
    @IdCancha INT,
    @Cliente  NVARCHAR(100),
    @Fecha    DATE,
    @Hora     NVARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    -- Cliente no vacío
    IF @Cliente IS NULL OR LTRIM(RTRIM(@Cliente)) = N''
    BEGIN
        THROW 50003, N'El nombre del cliente no puede estar vacío.', 1;
    END

    -- Cancha existente
    IF NOT EXISTS (SELECT 1 FROM Canchas WHERE IdCancha = @IdCancha)
    BEGIN
        THROW 50002, N'La cancha indicada no existe.', 1;
    END

    -- Horario libre (misma cancha, fecha y hora)
    IF EXISTS (
        SELECT 1
        FROM Reservas
        WHERE IdCancha = @IdCancha
          AND Fecha = @Fecha
          AND Hora = @Hora
    )
    BEGIN
        THROW 50011, N'Ese horario ya está reservado para esta cancha.', 1;
    END

    INSERT INTO Reservas (IdCancha, Cliente, Fecha, Hora, Pagada)
    VALUES (@IdCancha, LTRIM(RTRIM(@Cliente)), @Fecha, @Hora, 0);

    SELECT SCOPE_IDENTITY() AS IdReserva;
END
GO

/* ------------------------------------------------------------------
   9. usp_RegistrarPago
      Marca una reserva como pagada. THROW si no existe (50002)
      o si ya estaba pagada (50008).
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.usp_RegistrarPago', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_RegistrarPago;
GO

CREATE PROCEDURE dbo.usp_RegistrarPago
    @IdReserva INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Reservas WHERE IdReserva = @IdReserva)
    BEGIN
        THROW 50002, N'La reserva indicada no existe.', 1;
    END

    IF EXISTS (SELECT 1 FROM Reservas WHERE IdReserva = @IdReserva AND Pagada = 1)
    BEGIN
        THROW 50008, N'Esa reserva ya estaba pagada.', 1;
    END

    UPDATE Reservas
    SET Pagada = 1
    WHERE IdReserva = @IdReserva;
END
GO

/* ------------------------------------------------------------------
   10. usp_RecaudacionPorCancha
       Por cancha: cantidad de reservas, total cobrado y total
       pendiente. Las canchas sin reservas aparecen con ceros.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.usp_RecaudacionPorCancha', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_RecaudacionPorCancha;
GO

CREATE PROCEDURE dbo.usp_RecaudacionPorCancha
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.IdCancha,
        c.Nombre,
        COUNT(r.IdReserva) AS CantidadReservas,
        ISNULL(SUM(CASE WHEN r.Pagada = 1 THEN c.PrecioPorHora ELSE 0 END), 0) AS TotalCobrado,
        ISNULL(SUM(CASE WHEN r.Pagada = 0 THEN c.PrecioPorHora ELSE 0 END), 0) AS TotalPendiente
    FROM Canchas AS c
    LEFT JOIN Reservas AS r
        ON r.IdCancha = c.IdCancha
    GROUP BY c.IdCancha, c.Nombre
    ORDER BY c.IdCancha;
END
GO
