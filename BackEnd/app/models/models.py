from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Numeric,
    Date,
    TIMESTAMP,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
    text,
    Sequence
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# ------------------------------------------------------
# Tabla Deporte
# ------------------------------------------------------
class Deporte(Base):
    __tablename__ = "deporte"

    id = Column(Integer, Sequence("deporte_id_seq"), primary_key=True, autoincrement=True)
    codigo = Column(String(15), unique=True, nullable=False)
    nombre = Column(String(30), nullable=False, unique=True)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)

    # Relaciones
    spots = relationship("DeporteSpot", back_populates="deporte")
    variables = relationship("DeporteVariable", back_populates="deporte")


# ------------------------------------------------------
# Tabla Spot
# ------------------------------------------------------
class Spot(Base):
    __tablename__ = "spot"

    id = Column(Integer, Sequence("spot_id_seq"), primary_key=True, autoincrement=True)
    codigo = Column(String(15), unique=True, nullable=False)
    nombre = Column(String(30), nullable=False)
    tipo = Column(String(20))
    lat = Column(Numeric(10, 6), nullable=False)
    lon = Column(Numeric(10, 6), nullable=False)
    activo = Column(Boolean, default=True)

    # Relaciones
    deportes = relationship("DeporteSpot", back_populates="spot")
    variables_meteorologicas = relationship("VariableMeteorologica", back_populates="spot_rel")


# ------------------------------------------------------
# Tabla ProveedorDatos
# ------------------------------------------------------
class ProveedorDatos(Base):
    __tablename__ = "proveedor_datos"

    id = Column(Integer, Sequence("proveedor_id_seq"), primary_key=True, autoincrement=True)
    codigo = Column(String(15), unique=True, nullable=False)
    nombre = Column(String(30), nullable=False)
    url_base = Column(String(255))
    politica_licencia = Column(Text)

    # Relaciones
    variables_meteorologicas = relationship("VariableMeteorologica", back_populates="proveedor_rel")


# ------------------------------------------------------
# Tabla VariableMeteorologica
# ------------------------------------------------------
class VariableMeteorologica(Base):
    __tablename__ = "variable_meteorologica"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_tipo_variable = Column(Integer, ForeignKey("tipo_variable_meteorologica.id"), nullable=False)
    id_proveedor = Column(Integer, ForeignKey("proveedor_datos.id"), nullable=False)
    id_spot = Column(Integer, ForeignKey("spot.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    valor = Column(Text, nullable=False)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    ultima_actualizacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    tipo_variable_rel = relationship("TipoVariableMeteorologica", back_populates="variables")
    proveedor_rel = relationship("ProveedorDatos", back_populates="variables_meteorologicas")
    spot_rel = relationship("Spot", back_populates="variables_meteorologicas")


# ------------------------------------------------------
# Tabla TipoVariableMeteorologica
# ------------------------------------------------------

class TipoVariableMeteorologica(Base):
    __tablename__ = "tipo_variable_meteorologica"

    id = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String(15), unique=True, nullable=False)
    nombre = Column(String(50), nullable=False, unique=True)
    unidad = Column(String(20))
    tipo = Column(String(20))  # numérico, direccional, etc.
    descripcion = Column(Text)

    variables = relationship("VariableMeteorologica", back_populates="tipo_variable_rel")



# ------------------------------------------------------
# Tabla intermedia DeporteSpot
# ------------------------------------------------------
class DeporteSpot(Base):
    __tablename__ = "deporte_spot"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_spot = Column(Integer, ForeignKey("spot.id"), nullable=False)
    id_deporte = Column(Integer, ForeignKey("deporte.id"), nullable=False)
    ponderacion = Column(Integer)
    fecha = Column(Date, nullable=False)
    ultima_actualizacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relaciones
    deporte = relationship("Deporte", back_populates="spots")
    spot = relationship("Spot", back_populates="deportes")


# ------------------------------------------------------
# Tabla intermedia DeporteVariable
# ------------------------------------------------------
class DeporteVariable(Base):
    __tablename__ = "deporte_variable"

    id_deporte = Column(Integer, ForeignKey("deporte.id"), nullable=False)
    nombre_variable = Column(String(50), nullable=False)
    umbral_min = Column(Numeric)
    umbral_max = Column(Numeric)
    peso = Column(Integer)
    estado = Column(String(50))
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    operador = Column(String(10))

    __table_args__ = (
        PrimaryKeyConstraint("id_deporte", "nombre_variable"),
    )

    # Relaciones
    deporte = relationship("Deporte", back_populates="variables")
    
# ------------------------------------------------------
# Tabla Usuario
# ------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, Sequence("usuario_id_seq"), primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    telefono = Column(String(30))
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    tipo_usuario = Column(String(20), default="owner")
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relaciones
    negocios = relationship("Negocio", back_populates="usuario")

# ------------------------------------------------------
# Tabla Negocio
# ------------------------------------------------------

class Negocio(Base):
    __tablename__ = "negocio"

    id_negocio = Column(Integer, Sequence("negocio_id_seq"), primary_key=True, autoincrement=True)
    id_dueno = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    nombre_fantasia = Column(String(100), nullable=False)
    rubro = Column(String(50))
    sitio_web = Column(String(255))
    telefono = Column(String(30))
    email = Column(String(100))
    direccion = Column(String(255))
    lat = Column(Numeric(10, 6), nullable=False)
    lon = Column(Numeric(10, 6), nullable=False)
    horarios = Column(String(255))  
    activo = Column(Boolean, default=True)
    activo_hasta = Column(Date)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    descripcion = Column(Text)

    # Relaciones
    deportes = relationship("NegocioDeporte", backref="negocio")
    usuario = relationship("Usuario", back_populates="negocios")

# ------------------------------------------------------
# Tabla intermedia Negocio_Deporte
# ------------------------------------------------------
class NegocioDeporte(Base):
    __tablename__ = "negocio_deporte"

    id_negocio = Column(Integer, ForeignKey("negocio.id_negocio"), nullable=False)
    id_deporte = Column(Integer, ForeignKey("deporte.id"), nullable=False)
    tipo_servicio = Column(String(20))

    __table_args__ = (
        PrimaryKeyConstraint("id_negocio", "id_deporte"),
    )