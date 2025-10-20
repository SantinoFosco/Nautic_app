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
    coordenadas = Column(String(100))  # Guardamos como texto (ej. JSON)
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

    id = Column(Integer, Sequence("variable_id_seq"), primary_key=True, autoincrement=True)
    codigo = Column(String(15), unique=True, nullable=False)
    id_proveedor = Column(Integer, ForeignKey("proveedor_datos.id"), nullable=False)
    id_spot = Column(Integer, ForeignKey("spot.id"), nullable=False)
    nombre = Column(String(30), nullable=False)
    fecha = Column(Date)
    unidad_base = Column(String(20))
    tipo_dato = Column(String(20), nullable=False)
    rango_min = Column(Numeric)
    rango_max = Column(Numeric)
    valor = Column(Text)
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    ultima_actualizacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relaciones
    proveedor_rel = relationship("ProveedorDatos", back_populates="variables_meteorologicas")
    spot_rel = relationship("Spot", back_populates="variables_meteorologicas")
    deportes = relationship("DeporteVariable", back_populates="variable_rel")


# ------------------------------------------------------
# Tabla intermedia DeporteSpot
# ------------------------------------------------------
class DeporteSpot(Base):
    __tablename__ = "deporte_spot"

    id_spot = Column(Integer, ForeignKey("spot.id"), nullable=False)
    id_deporte = Column(Integer, ForeignKey("deporte.id"), nullable=False)
    estado = Column(String(20))
    ultima_actualizacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        PrimaryKeyConstraint("id_spot", "id_deporte"),
    )

    # Relaciones
    deporte = relationship("Deporte", back_populates="spots")
    spot = relationship("Spot", back_populates="deportes")


# ------------------------------------------------------
# Tabla intermedia DeporteVariable
# ------------------------------------------------------
class DeporteVariable(Base):
    __tablename__ = "deporte_variable"

    id_deporte = Column(Integer, ForeignKey("deporte.id"), nullable=False)
    id_variable = Column(Integer, ForeignKey("variable_meteorologica.id"), nullable=False)
    umbral_min = Column(Numeric)
    umbral_max = Column(Numeric)
    valor_lista = Column(Text)
    peso = Column(Integer)
    estado = Column(String(50))
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    operador = Column(String(10))

    __table_args__ = (
        PrimaryKeyConstraint("id_deporte", "id_variable"),
    )

    # Relaciones
    deporte = relationship("Deporte", back_populates="variables")
    variable_rel = relationship("VariableMeteorologica", back_populates="deportes")
