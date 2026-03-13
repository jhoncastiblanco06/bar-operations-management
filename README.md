# Bar Operations Management

Sistema web para la **gestión integral de operaciones de bares multisede**, diseñado para centralizar inventario, ventas, pedidos y control administrativo en una sola plataforma.

Desarrollado como proyecto de portafolio por **Jhon Castiblanco Cárdenas**.

---

# Descripción del proyecto

**Bar Operations Management** es una plataforma web responsive que permite administrar de forma centralizada la operación de múltiples sedes de un bar.

El sistema integra herramientas para el control de pedidos, inventario, facturación, gestión de mesas, usuarios y reportes operativos, permitiendo mejorar la eficiencia del negocio y reducir errores operativos.

La solución está pensada para establecimientos con múltiples sedes que necesitan **control operacional en tiempo real**.

---

# Arquitectura del sistema

El sistema fue diseñado bajo una arquitectura **de servicios desacoplados mediante contenedores** usando Docker.

Componentes principales:

```
Usuario
   │
Frontend (Next.js)
   │
Backend API (NestJS)
   │
Base de Datos (PostgreSQL + PostGIS)
```

Cada componente se ejecuta en un contenedor independiente y se comunica mediante una red privada de Docker.

---

# Stack tecnológico

### Backend

* Node.js
* NestJS
* REST API

### Frontend

* Next.js
* JavaScript / TypeScript
* Responsive Web Design

### Base de Datos

* PostgreSQL
* PostGIS

### Infraestructura

* Docker
* Docker Compose

---

# Arquitectura de contenedores

El sistema se despliega utilizando **3 contenedores principales**:

| Servicio | Descripción              |
| -------- | ------------------------ |
| frontend | Interfaz web del sistema |
| backend  | API y lógica de negocio  |
| database | Base de datos PostgreSQL |


# Docker Compose

El proyecto se orquesta mediante Docker Compose.

Servicios definidos:

* Frontend
* Backend
* Base de datos

Red privada:

```
network_bar
```

Esto permite comunicación interna segura entre los servicios.

---

# Dockerfile

El proyecto utiliza una imagen ligera de Node:

```
node:20-alpine
```

Ventajas:

* menor tamaño de imagen
* mayor velocidad de despliegue
* menor consumo de recursos

---

# Módulos funcionales del sistema

El sistema está compuesto por **9 módulos principales**.

### 1. Autenticación y Control de Acceso

Sistema de login con roles:

* Administrador
* Cajero
* Mesero

Cada rol posee permisos específicos dentro del sistema.

---

### 2. Gestión de Pedidos

Permite a los meseros:

* abrir cuentas
* registrar pedidos
* verificar disponibilidad de productos

Todo en tiempo real.

---

### 3. Control de Inventario

Motor central del sistema que:

* descuenta productos automáticamente
* bloquea ventas sin stock
* mantiene control por sede.

---

### 4. Gestión de Ventas

Interfaz exclusiva del cajero para:

* visualizar pedidos
* procesar pagos
* cerrar cuentas
* registrar ventas en barra.

---

### 5. Gestión de Mesas

Mapa virtual de mesas por sede.

Estados:

* libre
* ocupada

El estado cambia automáticamente tras el pago.

---

### 6. Gestión de Sedes

El administrador puede:

* crear sedes
* editar sedes
* desactivar sedes

Cada sede mantiene datos independientes.

---

### 7. Gestión de Usuarios

Permite administrar el personal:

* creación de usuarios
* asignación de sede
* asignación de rol.

---

### 8. Reportes

Generación de reportes exportables a PDF con filtros:

* rango de fechas
* sede
* volumen de ventas
* rotación de inventario.

---

### 9. Panel Administrativo

Dashboard central de administración donde se gestionan:

* sedes
* mesas
* productos
* usuarios
* inventario.

---

# Roles del sistema

## Administrador

Control total del sistema.

Funciones principales:

* parametrización global
* gestión de inventario
* generación de reportes
* administración de sedes.

---

## Cajero

Encargado del flujo de caja.

Funciones:

* validar pedidos
* facturación
* cierre de cuentas
* reportes de ventas por sede.

---

## Mesero

Encargado de registrar pedidos en mesa.

Funciones:

* registrar pedidos
* verificar disponibilidad
* asignar mesa
* actualizar estado de mesa.

---

# Base de datos

El sistema utiliza **PostgreSQL** con un modelo relacional basado en múltiples entidades.

Principales tablas:

* usuarios
* sedes
* mesas
* productos
* categorias
* inventario_sedes
* cuentas
* detalle_cuentas
* pagos_facturas
* movimientos_inventario
* cierres_caja

El modelo permite mantener **separación operativa por sede**.


# Metodología de desarrollo

El proyecto fue desarrollado utilizando **metodología ágil**, basada en:

* entregas incrementales
* ciclos de desarrollo de 2 semanas
* validación continua de funcionalidades.

---

# Alcance del proyecto

El sistema incluye:

* control de inventario
* gestión de pedidos
* administración de mesas
* reportes operativos
* gestión de usuarios.

---

# Limitaciones del sistema

El proyecto **no incluye**:

* pasarelas de pago
* auditoría de horarios del personal
* alertas automáticas de stock
* soporte multilenguaje
* sistema de notificaciones
* gestión de propinas.

---

# Autor

Desarrollado por:

**Jhon Castiblanco Cárdenas**
Ingeniero de Sistemas

Proyecto desarrollado como **portafolio profesional**.

---

# Licencia

Este proyecto se distribuye bajo una licencia **no comercial personalizada**.

El código puede ser utilizado para fines educativos y de estudio, pero **no puede ser redistribuido ni comercializado sin autorización del autor**.
