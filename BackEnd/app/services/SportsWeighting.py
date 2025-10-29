from datetime import datetime
from requests import Session
from app.models.models import Spot, VariableMeteorologica
from app.models.models import Deporte, DeporteVariable, VariableMeteorologica, DeporteSpot, TipoVariableMeteorologica
from sqlalchemy import and_, func, distinct
from datetime import datetime

def sports_weighting(session: Session, id_spot: int, fecha):
    """
    Calcula la ponderación (0–100) de cada deporte para un spot en una fecha
    según las reglas definidas en DeporteVariable y los valores en VariableMeteorologica.
    """
    # 1️⃣ Obtener todos los deportes
    deportes = session.query(Deporte).all()
    if not deportes:
        return

    # 2️⃣ Obtener variables del día para el spot
    variables_dia = (
        session.query(VariableMeteorologica)
        .filter(
            and_(
                VariableMeteorologica.id_spot == id_spot,
                VariableMeteorologica.fecha == fecha,
            )
        )
        .all()
    )

    # Mapear {nombre_variable: valor}
    valores = {}
    for var in variables_dia:
        tipo_var = session.query(TipoVariableMeteorologica).filter_by(id=var.id_tipo_variable).first()
        if tipo_var:
            try:
                valores[tipo_var.nombre] = float(var.valor)
            except ValueError:
                continue

    # 3️⃣ Calcular ponderación por deporte
    for dep in deportes:
        ponderacion_total = 0
        peso_total = 0

        reglas = session.query(DeporteVariable).filter(DeporteVariable.id_deporte == dep.id).all()

        for regla in reglas:
            nombre_var = regla.nombre_variable
            if nombre_var not in valores:
                continue

            val = valores[nombre_var]
            min_v = float(regla.umbral_min or 0)
            max_v = float(regla.umbral_max or 0)
            peso = float(regla.peso or 1)

            score = 0
            if regla.operador == "min":
                score = max(0, 100 - (val - min_v) * 10)
            elif regla.operador == "max":
                score = max(0, 100 - (max_v - val) * 10)
            elif regla.operador == "between":
                if min_v <= val <= max_v:
                    score = 100
                else:
                    dist = min(abs(val - min_v), abs(val - max_v))
                    score = max(0, 100 - dist * 10)

            ponderacion_total += score * peso
            peso_total += peso

        # 4️⃣ Promedio ponderado
        ponderacion_final = round(ponderacion_total / peso_total, 2) if peso_total else 0

        # 5️⃣ Insertar o actualizar en DeporteSpot
        existing = (
            session.query(DeporteSpot)
            .filter(
                and_(
                    DeporteSpot.id_spot == id_spot,
                    DeporteSpot.id_deporte == dep.id,
                    DeporteSpot.fecha == fecha,
                )
            )
            .one_or_none()
        )

        if existing:
            existing.ponderacion = ponderacion_final
            existing.ultima_actualizacion = func.now()
        else:
            session.add(
                DeporteSpot(
                    id_spot=id_spot,
                    id_deporte=dep.id,
                    ponderacion=ponderacion_final,
                    fecha=fecha,
                    ultima_actualizacion=datetime.utcnow(),
                )
            )

def ponderar_todos_los_deportes(session: Session):
    """
    Recorre todos los spots y fechas en VariableMeteorologica,
    y calcula las ponderaciones deportivas para cada combinación.
    """
    print("⚖️ Iniciando ponderación de todos los deportes en todos los spots...")

    # 1️⃣ Obtener todas las fechas registradas en VariableMeteorologica
    fechas = [row[0] for row in session.query(distinct(VariableMeteorologica.fecha)).all()]
    fechas = sorted(fechas)
    print(f"📅 Fechas encontradas para procesar: {fechas}")

    # 2️⃣ Obtener todos los spots
    spots = session.query(Spot).all()
    print(f"📍 Spots encontrados: {[s.nombre for s in spots]}")

    # 3️⃣ Iterar spot x fecha
    for spot in spots:
        for fecha in fechas:
            try:
                print(f"➡️ Ponderando {spot.nombre} para {fecha}...")
                sports_weighting(session, spot.id, fecha)
            except Exception as e:
                print(f"❌ Error ponderando {spot.nombre} ({fecha}): {e}")
                session.rollback()

    session.commit()
    print("✅ Ponderación global finalizada.")