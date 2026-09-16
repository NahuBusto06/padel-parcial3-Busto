/* ==================================================================
   PadelDB - Parcial 3 - Programación II
   Instituto Superior Villa del Rosario - Ciclo 2026
   Complejo de pádel "El Rebote"
   ================================================================== */

/* ------------------------------------------------------------------
   0. Crear la base de datos (si no existe todavía)
   ------------------------------------------------------------------ */
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'PadelDB')
BEGIN
    CREATE DATABASE PadelDB;
END
GO

USE PadelDB;
GO

/* ------------------------------------------------------------------
   1. Bloque estándar de permisos de la cátedra (prog2)
      - Login a nivel servidor (una sola vez para toda la instancia)
      - User a nivel de ESTA base
      - Permiso db_owner sobre PadelDB
   ------------------------------------------------------------------ */

-- 1a) LOGIN
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'prog2')
BEGIN
    CREATE LOGIN prog2
        WITH PASSWORD = N'Prog2.2026',
        CHECK_POLICY = OFF,
        CHECK_EXPIRATION = OFF;
END
GO

-- 1b) USER dentro de PadelDB
USE PadelDB;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'prog2')
BEGIN
    CREATE USER prog2 FOR LOGIN prog2;
END
GO

-- 1c) PERMISOS: prog2 es dueño de esta base
ALTER ROLE db_owner ADD MEMBER prog2;
GO

/* ------------------------------------------------------------------
   2. Tabla Canchas
      Almacena la identificación y el precio por hora de cada cancha.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Canchas', 'U') IS NOT NULL
    DROP TABLE dbo.Canchas;
GO

CREATE TABLE dbo.Canchas (
    IdCancha      INT IDENTITY(1,1) NOT NULL,
    Nombre        NVARCHAR(100)     NOT NULL,
    PrecioPorHora DECIMAL(10,2)     NOT NULL,
    CONSTRAINT PK_Canchas PRIMARY KEY (IdCancha),
    CONSTRAINT UQ_Canchas_Nombre UNIQUE (Nombre),
    CONSTRAINT CK_Canchas_Precio CHECK (PrecioPorHora > 0)
);
GO

/* ------------------------------------------------------------------
   3. Tabla Reservas
      Registra el cliente, la cancha, el día, la hora y el estado
      de pago de cada reserva.
   ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Reservas', 'U') IS NOT NULL
    DROP TABLE dbo.Reservas;
GO

CREATE TABLE dbo.Reservas (
    IdReserva INT IDENTITY(1,1) NOT NULL,
    IdCancha  INT                NOT NULL,
    Cliente   NVARCHAR(100)      NOT NULL,
    Fecha     DATE               NOT NULL,
    Hora      NVARCHAR(5)        NOT NULL,
    Pagada    BIT                NOT NULL CONSTRAINT DF_Reservas_Pagada DEFAULT (0),
    CONSTRAINT PK_Reservas PRIMARY KEY (IdReserva),
    CONSTRAINT FK_Reservas_Canchas FOREIGN KEY (IdCancha)
        REFERENCES dbo.Canchas (IdCancha),
    -- Punto 4 del enunciado: impide dos reservas de la misma cancha,
    -- misma fecha y misma hora.
    CONSTRAINT UQ_Reservas_Horario UNIQUE (IdCancha, Fecha, Hora)
);
GO
