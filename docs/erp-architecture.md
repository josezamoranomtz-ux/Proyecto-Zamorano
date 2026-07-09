# Arquitectura de datos del ERP Proyecto Zamorano

## 1. Objetivo de la arquitectura

El sistema debe funcionar como una plataforma empresarial unificada, donde cada módulo use las mismas entidades maestras y comparta información cuando corresponda. La meta es evitar duplicación de clientes, productos, cuentas, documentos, personas y eventos.

## 2. Principios de diseño

- Un solo registro maestro por entidad de negocio.
- Los módulos deben referenciar IDs compartidos, no copiar datos.
- Los documentos, movimientos y eventos deben poder vincularse a múltiples módulos.
- La estructura debe soportar crecimiento sin reescribir la base del sistema.
- Cada módulo debe poder operar con su propia vista, pero consumir datos del núcleo común.

## 3. Núcleo compartido del sistema

### Entidades maestras

1. Parties
   - Representa a clientes, proveedores, empleados, socios y contactos.
   - Campos clave: id, type, name, legalName, taxId, email, phone, address, status.

2. Companies
   - Representa a las empresas del grupo, sucursales o unidades operativas.
   - Campos clave: id, name, rfc, address, phone, email, parentCompanyId.

3. Accounts
   - Catálogo de cuentas contables.
   - Campos clave: id, code, name, type, parentAccountId, active.

4. InventoryItems
   - Catálogo de productos, materiales, herramientas y servicios parametrizables.
   - Campos clave: id, sku, name, category, unit, cost, price, stock, minStock, active.

5. Documents
   - Repositorio central de contratos, facturas, órdenes, imágenes y archivos.
   - Campos clave: id, module, referenceId, title, type, url, uploadedAt, ownerId.

6. CalendarEvents
   - Tareas, citas, audiencias, entregas y recordatorios.
   - Campos clave: id, title, module, referenceId, startAt, endAt, ownerId, status.

7. Users and Roles
   - Usuarios del sistema y permisos por rol.
   - Campos clave: id, name, email, role, companyId, active.

8. Settings
   - Parámetros generales del sistema: impuestos, monedas, plantillas, numeración, alertas.

## 4. Módulos y relaciones principales

### Jurídico
- Usa Parties para clientes y contrapartes.
- Usa Cases para expedientes.
- Usa CalendarEvents para audiencias y tareas.
- Puede vincularse a Documents y a Payments o Invoices cuando exista un cobro o gasto relacionado.

Relación principal:
- Case.clientPartyId -> Parties.id
- Case.assignedUserId -> Users.id
- Case.documentId -> Documents.id

### Inventario
- Usa InventoryItems como base de productos y materiales.
- Usa InventoryMovements para entradas, salidas, traslados y ajustes.
- Se integra con Compras para recibir mercancía y con Ventas para despachar.
- Puede vincularse a Construcción y Herrería como insumo de proyectos u órdenes.

Relación principal:
- InventoryMovement.itemId -> InventoryItems.id
- InventoryMovement.referenceType -> PurchaseOrder|SalesOrder|WorkOrder|Project
- InventoryMovement.companyId -> Companies.id

### Contabilidad
- Usa Accounts como estructura de catálogo.
- Usa Transactions para registrar ingresos, egresos, pagos, cargos y abonos.
- Se alimenta de Compras, Ventas, Pagos, Facturas y Nóminas.
- Debe poder construir estados financieros sin duplicar datos.

Relación principal:
- Transaction.accountId -> Accounts.id
- Transaction.partyId -> Parties.id
- Transaction.documentId -> Documents.id

### Administración
- Usa Companies, Users, Settings y Reportes.
- Centraliza indicadores generales del negocio y supervisión de módulos.
- Puede consultar ventas, compras, costos, proyectos y flujo de caja.

Relación principal:
- AdministrativeDashboard.companyId -> Companies.id
- AdministrativeDashboard.userId -> Users.id

### Recursos Humanos
- Usa Parties o una entidad específica Employees.
- Se vincula con Calendario, Nóminas y Configuración.
- Los empleados pueden tener documentos, tareas, asistencias y pagos asociados.

Relación principal:
- Employee.partyId -> Parties.id
- Employee.companyId -> Companies.id
- Employee.userId -> Users.id

### Documentos centralizados
- Es un módulo transversal.
- Recibe referencias de cualquier módulo mediante referenceId y module.
- Permite búsquedas por entidad, empresa, tipo y fecha.

Relación principal:
- Document.module + Document.referenceId -> cualquier módulo del sistema

### Construcción
- Usa Projects como entidad principal.
- Puede consumir InventoryItems y CalendarEvents.
- Puede generar órdenes de trabajo o requerimientos de materiales.
- Puede relacionarse con Clientes y Proveedores.

Relación principal:
- Project.companyId -> Companies.id
- Project.clientPartyId -> Parties.id
- Project.materialItemId -> InventoryItems.id

### Herrería
- Usa WorkOrders como entidad central de producción.
- Puede consumir InventoryItems y Project/Construction data.
- Se integra con calendario y con inventario para control de entregas.

Relación principal:
- WorkOrder.projectId -> Project.id
- WorkOrder.itemId -> InventoryItems.id
- WorkOrder.clientPartyId -> Parties.id

### Ruiz Graphics
- Usa DesignOrders o ProductionOrders.
- Se integra con Clientes, Documentos y Calendario.
- Puede enlazarse a entregables y archivos finales.

Relación principal:
- DesignOrder.clientPartyId -> Parties.id
- DesignOrder.documentId -> Documents.id

### Clientes
- Es una vista de Parties filtrada por tipo cliente.
- Sirve de base para ventas, jurídico, construcción y diseño.

Relación principal:
- Customer.partyId -> Parties.id

### Proveedores
- Es una vista de Parties filtrada por tipo proveedor.
- Sirve de base para compras, inventario y contabilidad.

Relación principal:
- Supplier.partyId -> Parties.id

### Compras
- Usa PurchaseOrders y PurchaseOrderLines.
- Se relaciona con Proveedores, InventoryItems, Accounts y Documents.
- Los gastos generados alimentan Contabilidad.

Relación principal:
- PurchaseOrder.supplierPartyId -> Parties.id
- PurchaseOrderLine.itemId -> InventoryItems.id
- PurchaseOrder.documentId -> Documents.id

### Ventas
- Usa SalesOrders, SalesOrderLines, Invoices y Payments.
- Se relaciona con Clientes, InventoryItems, Accounts y Documents.
- Genera ingresos y afecta inventario y contabilidad.

Relación principal:
- SalesOrder.clientPartyId -> Parties.id
- SalesOrderLine.itemId -> InventoryItems.id
- Invoice.orderId -> SalesOrder.id

### Agenda y calendario
- Es un módulo transversal para tareas, audiencias, entregas y recordatorios.
- Debe poder referenciar cualquier entidad con module y referenceId.

Relación principal:
- CalendarEvent.referenceId + CalendarEvent.module -> módulo origen

### Reportes y estadísticas
- Consume datos consolidados de todos los módulos.
- No debe almacenar información duplicada; debe leer de las tablas maestras y transaccionales.

Relación principal:
- Report.dataset -> Transactions|Sales|Purchases|InventoryMovements|Projects|WorkOrders|Cases

### Configuración general
- Define usuarios, permisos, impuestos, numeración, criterios de negocio y plantillas.
- Es la capa de parametrización del ERP.

Relación principal:
- Configuration.companyId -> Companies.id

## 5. Relación transversal recomendada

El diseño más escalable es este patrón:

- Parties y Companies son las entidades centrales de negocio.
- InventoryItems, Accounts y Documents son recursos compartidos.
- Las transacciones y procesos (ventas, compras, proyectos, expedientes) apuntan a estas entidades maestras.
- Los eventos y documentos se vinculan a cualquier proceso mediante un identificador común.

## 6. Esquema de integración entre módulos

- Legal -> Parties, Documents, CalendarEvents, Transactions
- Inventory -> Purchases, Sales, Projects, WorkOrders
- Accounting -> Purchases, Sales, Transactions, Documents
- HR -> Parties, Users, CalendarEvents, Documents
- Construction -> Companies, Parties, InventoryItems, CalendarEvents
- Foundry -> Parties, InventoryItems, Projects, Documents
- Ruiz Graphics -> Parties, Documents, CalendarEvents
- Sales -> Parties, InventoryItems, Documents, Accounting
- Purchases -> Parties, InventoryItems, Accounting
- Reports -> Todos los módulos transaccionales

## 7. Propuesta de implementación inicial

1. Definir entidades maestras: Parties, Companies, Accounts, InventoryItems, Documents, CalendarEvents, Users.
2. Implementar módulos transversales: Documentos, Agenda y Configuración.
3. Después, agregar Inventario, Compras y Ventas.
4. Luego, Contabilidad y Reportes.
5. Finalizar con Jurídico, Construcción, Herrería, Ruiz Graphics y Recursos Humanos.

## 8. Recomendación técnica para el proyecto actual

Para esta aplicación, lo más adecuado es mantener un modelo de estado central en el frontend y luego migrarlo a una base de datos relacional en una segunda etapa. El diseño actual debe prepararse para que cada módulo espere:

- un id de empresa,
- un id de entidad relacionada,
- un id de documento y
- un id de usuario responsable.
