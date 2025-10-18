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
    text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Deporte(Base):
    __tablename__ = "deporte"

    id_deporte = Column(String(15), primary_key=True, server_default=text("'DEP' || nextval('deporte_id_seq')"))
    nombre = Column(String(30), nullable=False, unique=True)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)

    # Relaciones
    spots = relationship("DeporteSpot", back_populates="deporte")
    variables = relationship("DeporteVariable", back_populates="deporte")


class Spot(Base):
    __tablename__ = "spot"

    id_spot = Column(String(15), primary_key=True, server_default=text("'SPT' || nextval('spot_id_seq')"))
    nombre = Column(String(30), nullable=False)
    tipo = Column(String(20))
    coordenadas = Column(String(100))  # SQLAlchemy no tiene POINT nativo; se guarda como texto o JSON
    activo = Column(Boolean, default=True)

    # Relaciones
    deportes = relationship("DeporteSpot", back_populates="spot")
    variables_meteorologicas = relationship("VariableMeteorologica", back_populates="spot_rel")


class ProveedorDatos(Base):
    __tablename__ = "proveedor_datos"

    id_proveedor = Column(String(15), primary_key=True, server_default=text("'PRV' || nextval('proveedor_datos_id_seq')"))
    nombre = Column(String(30), nullable=False)
    url_base = Column(String(255))
    politica_licencia = Column(Text)

    # Relaciones
    variables_meteorologicas = relationship("VariableMeteorologica", back_populates="proveedor_rel")


class VariableMeteorologica(Base):
    __tablename__ = "variable_meteorologica"

    id_variable = Column(String(15), primary_key=True, server_default=text("'VAR' || nextval('variable_meteorologica_id_seq')"))
    id_proveedor = Column(String(15), ForeignKey("proveedor_datos.id_proveedor"), nullable=False)
    spot = Column(String(15), ForeignKey("spot.id_spot"), nullable=False)
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


class DeporteSpot(Base):
    __tablename__ = "deporte_spot"

    id_spot = Column(String(15), ForeignKey("spot.id_spot"), nullable=False)
    id_deporte = Column(String(15), ForeignKey("deporte.id_deporte"), nullable=False)
    estado = Column(String(20))
    ultima_actualizacion = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        PrimaryKeyConstraint("id_spot", "id_deporte"),
    )

    # Relaciones
    deporte = relationship("Deporte", back_populates="spots")
    spot = relationship("Spot", back_populates="deportes")


class DeporteVariable(Base):
    __tablename__ = "deporte_variable"

    id_deporte = Column(String(15), ForeignKey("deporte.id_deporte"), nullable=False)
    id_variable = Column(String(15), ForeignKey("variable_meteorologica.id_variable"), nullable=False)
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
