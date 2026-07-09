import { useEffect, useMemo, useState } from 'react';
import { createBackupBlob, getBackupWarningState, importBackupFromText } from './backupUtils';
import { applyPurchaseTransaction, applySalesTransaction, getAccountingSummary } from './erpBusinessLogic';

const STORAGE_KEY = 'proyecto-zamorano-data';
const AUTH_KEY = 'proyecto-zamorano-auth';

const defaultData = {
  clients: [
    {
      id: 'c1',
      name: 'María Elena Flores',
      phone: '55 1234 5678',
      email: 'maria.flores@correo.com',
      address: 'Av. Revolución 154, CDMX',
      matter: 'Familiar',
      observations: 'Requiere seguimiento mensual.'
    }
  ],
  cases: [
    {
      id: 'e1',
      caseNumber: 'EXP-2026-001',
      clientId: 'c1',
      matter: 'Civil',
      court: 'Juzgado Primero Civil',
      description: 'Demanda por cumplimiento de contrato.',
      stage: 'Interlocutoria',
      nextAction: 'Presentar ofrecimiento de prueba.',
      status: 'urgente'
    }
  ],
  agenda: [
    {
      id: 'a1',
      title: 'Audiencia preliminar',
      type: 'Audiencia',
      dateTime: '2026-07-15T10:30',
      status: 'pendiente',
      relatedClientId: 'c1',
      description: 'Comparecencia ante el juez civil.'
    }
  ],
  payments: [
    {
      id: 'p1',
      clientId: 'c1',
      concept: 'Honorarios iniciales',
      amount: 15000,
      advance: 5000,
      partialPayments: 2000,
      dueDate: '2026-07-20',
      status: 'pendiente'
    }
  ],
  documents: [
    {
      id: 'd1',
      title: 'Contrato de prestación',
      type: 'contrato',
      date: '2026-07-01',
      clientId: 'c1',
      caseId: 'e1',
      observations: 'Versión firmada y archivada.'
    }
  ],
  matters: [
    'Civil',
    'Familiar',
    'Penal',
    'Mercantil',
    'Agrario',
    'Amparo',
    'Laboral',
    'Administrativo',
    'Fiscal',
    'Constitucional',
    'Notarial',
    'Sucesorio',
    'Arrendamiento',
    'Tránsito y accidentes',
    'Daño moral',
    'Cobranza judicial',
    'Cobranza extrajudicial',
    'Contratos',
    'Propiedad',
    'Derechos humanos',
    'Seguridad social',
    'Municipal',
    'Ejidal',
    'Migratorio'
  ],
  services: [
    {
      id: 's1',
      name: 'Asesoría preventiva',
      matter: 'Civil',
      description: 'Revisión preventiva de contratos y riesgos jurídicos.',
      basePrice: 5000,
      suggestedAdvance: 1500,
      paymentForm: 'fijo',
      estimatedTime: '5 días',
      requiredDocuments: 'Identificación, contrato base',
      observations: 'Incluye revisión inicial.',
      status: 'activo'
    }
  ],
  quotations: [
    {
      id: 'q1',
      clientId: 'c1',
      serviceId: 's1',
      matter: 'Civil',
      totalPrice: 5000,
      advance: 1500,
      pendingBalance: 3500,
      additionalExpenses: 800,
      discount: 0,
      finalTotal: 5800,
      quoteDate: '2026-07-01',
      paymentDeadline: '2026-07-10',
      status: 'pendiente',
      description: 'Asesoría preventiva de contratos.'
    }
  ],
  invoices: [
    {
      id: 'i1',
      folio: 'REC-20260701-001',
      date: '2026-07-01',
      clientId: 'c1',
      serviceId: 's1',
      concept: 'Asesoría preventiva',
      subtotal: 5000,
      discount: 0,
      expenses: 800,
      total: 5800,
      advance: 1500,
      balance: 4300,
      paymentMethod: 'transferencia',
      status: 'parcial'
    }
  ],
  templates: [
    {
      id: 't1',
      name: 'Contrato de prestación de servicios profesionales',
      matter: 'Civil',
      description: 'Machote general para contratación de servicios jurídicos.',
      content: 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES\n\nPor medio del presente, {{nombre_cliente}} contrata a {{nombre_despacho}} representado por {{abogado_responsable}} con cédula profesional {{cedula_profesional}}...'
    }
  ],
  generatedDocuments: [],
  suppliers: [
    {
      id: 'sup-1',
      name: 'Metal S.A. de C.V.',
      contact: 'Ing. Laura',
      email: 'compras@metal.com',
      phone: '81 5555 0101',
      address: 'Parque industrial Monterrey',
      balance: 0
    }
  ],
  inventoryItems: [
    {
      id: 'itm-1',
      sku: 'MAT-001',
      name: 'Acero galvanizado',
      category: 'Material',
      unit: 'kg',
      cost: 240,
      stock: 25,
      minStock: 5,
      description: 'Material base para producción'
    }
  ],
  purchases: [
    {
      id: 'pur-1',
      supplierId: 'sup-1',
      itemId: 'itm-1',
      quantity: 10,
      unitCost: 240,
      total: 2400,
      date: '2026-07-01',
      dueDate: '2026-07-10',
      status: 'recepcionada',
      notes: 'Compra inicial para inventario'
    }
  ],
  sales: [
    {
      id: 'sale-1',
      clientId: 'c1',
      itemId: 'itm-1',
      quantity: 3,
      unitPrice: 300,
      total: 900,
      date: '2026-07-02',
      status: 'cobrada',
      notes: 'Venta de prueba'
    }
  ],
  accountingEntries: [
    {
      id: 'acc-1',
      type: 'income',
      amount: 900,
      date: '2026-07-02',
      entityId: 'c1',
      description: 'Ingreso venta',
      relatedModule: 'sales'
    }
  ],
  enterprises: [
    {
      id: 'ent-1',
      name: 'Proyecto Zamorano',
      rfc: 'PZ-2026-001',
      address: 'Monterrey, NL',
      email: 'contacto@proyectozamorano.com',
      phone: '81 1111 2222',
      representative: 'Lic. Ana Zamorano',
      status: 'activo',
      observations: 'Empresa principal del grupo.'
    }
  ],
  foundryOrders: [
    {
      id: 'fnd-1',
      client: 'Herrería del Centro',
      product: 'Puerta metálica',
      quantity: 3,
      priority: 'alta',
      status: 'cotizada',
      deliveryDate: '2026-07-20',
      observations: 'Acero galvanizado.'
    }
  ],
  constructionProjects: [
    {
      id: 'cst-1',
      name: 'Obra residencial',
      client: 'Familia Zamorano',
      budget: 180000,
      estimated: 45,
      progress: 30,
      status: 'en progreso',
      observations: 'Avance de cimentación.'
    }
  ],
  ruizGraphicsOrders: [
    {
      id: 'rg-1',
      client: 'Muebles Ortega',
      service: 'Diseño corporativo',
      deliveryDate: '2026-07-18',
      status: 'en producción',
      observations: 'Material para campaña digital.'
    }
  ],
  dispatchProfile: {
    name: 'Despacho Zamorano',
    attorney: 'Lic. Ana Zamorano',
    professionalLicense: 'CP-2024-001',
    rfc: 'ZAMA760101ABC',
    address: 'Av. Juárez 210, Monterrey, NL',
    phone: '81 1234 5678',
    email: 'contacto@zamorano.com',
    website: 'www.zamoranolegal.com',
    logo: '',
    slogan: 'Defensa jurídica con criterio y compromiso.'
  }
};

const menuItems = [
  { id: 'dashboard', label: 'Centro de control' },
  { id: 'clients', label: 'Jurídico · Clientes' },
  { id: 'cases', label: 'Jurídico · Expedientes' },
  { id: 'agenda', label: 'Jurídico · Agenda' },
  { id: 'payments', label: 'Jurídico · Pagos' },
  { id: 'documents', label: 'Jurídico · Documentos' },
  { id: 'matters', label: 'Jurídico · Materias' },
  { id: 'services', label: 'Jurídico · Servicios' },
  { id: 'quotations', label: 'Jurídico · Cotizaciones' },
  { id: 'invoices', label: 'Jurídico · Facturas y recibos' },
  { id: 'templates', label: 'Jurídico · Contratos y machotes' },
  { id: 'generator', label: 'Jurídico · Generador' },
  { id: 'profile', label: 'Jurídico · Perfil' },
  { id: 'enterprises', label: 'Empresas' },
  { id: 'foundry', label: 'Herrería' },
  { id: 'construction', label: 'Construcción' },
  { id: 'ruizgraphics', label: 'Ruiz Graphics' },
  { id: 'suppliers', label: 'Proveedores' },
  { id: 'purchases', label: 'Compras' },
  { id: 'sales', label: 'Ventas' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'accounting', label: 'Contabilidad' },
  { id: 'administration', label: 'Administración' },
  { id: 'hr', label: 'Recursos humanos' },
  { id: 'documentsHub', label: 'Documentos' },
  { id: 'ai', label: 'Inteligencia artificial' },
  { id: 'configuration', label: 'Configuración' }
];

const moduleCatalog = [
  { id: 'clients', label: 'Jurídico', description: 'Administración completa del despacho jurídico.', status: 'En desarrollo', icon: '⚖️', target: 'clients' },
  { id: 'enterprises', label: 'Empresas', description: 'Centro administrativo para las empresas del grupo.', status: 'Preparado', icon: '🏢', target: 'enterprises' },
  { id: 'foundry', label: 'Herrería', description: 'Gestión de clientes, órdenes, producción y entregas.', status: 'Preparado', icon: '🔨', target: 'foundry' },
  { id: 'construction', label: 'Construcción', description: 'Control de obras, presupuestos, avances y bitácoras.', status: 'Preparado', icon: '🏗️', target: 'construction' },
  { id: 'ruizgraphics', label: 'Ruiz Graphics', description: 'Diseño, producción y pedidos para el área gráfica.', status: 'Preparado', icon: '🎨', target: 'ruizgraphics' },
  { id: 'inventory', label: 'Inventario', description: 'Herramientas, materiales, entradas, salidas y alertas.', status: 'Preparado', icon: '📦', target: 'inventory' },
  { id: 'accounting', label: 'Contabilidad', description: 'Ingresos, egresos, flujo de efectivo y reportes.', status: 'Preparado', icon: '📊', target: 'accounting' },
  { id: 'administration', label: 'Administración', description: 'Indicadores, productividad, estadísticas y planeación.', status: 'Preparado', icon: '🧭', target: 'administration' },
  { id: 'hr', label: 'Recursos humanos', description: 'Trabajadores, asistencia, salarios y evaluaciones.', status: 'Preparado', icon: '👥', target: 'hr' },
  { id: 'documentsHub', label: 'Documentos', description: 'Repositorio central de contratos, PDF, imágenes y plantillas.', status: 'Preparado', icon: '📁', target: 'documentsHub' },
  { id: 'ai', label: 'Inteligencia artificial', description: 'Asistente empresarial para resumir y analizar información.', status: 'Preparado', icon: '🤖', target: 'ai' },
  { id: 'configuration', label: 'Configuración', description: 'Usuarios, permisos, seguridad, respaldos y preferencias.', status: 'Preparado', icon: '⚙️', target: 'configuration' }
];

const roleAccessMap = {
  admin: ['dashboard', 'clients', 'cases', 'agenda', 'payments', 'documents', 'matters', 'services', 'quotations', 'invoices', 'templates', 'generator', 'profile', 'enterprises', 'foundry', 'construction', 'ruizgraphics', 'suppliers', 'purchases', 'sales', 'inventory', 'accounting', 'administration', 'hr', 'documentsHub', 'ai', 'configuration'],
  director: ['dashboard', 'clients', 'cases', 'agenda', 'payments', 'documents', 'matters', 'services', 'quotations', 'invoices', 'templates', 'generator', 'profile', 'enterprises', 'foundry', 'construction', 'ruizgraphics', 'suppliers', 'purchases', 'sales', 'inventory', 'accounting', 'administration', 'hr', 'documentsHub', 'ai', 'configuration'],
  abogado: ['dashboard', 'clients', 'cases', 'agenda', 'payments', 'documents', 'matters', 'services', 'quotations', 'invoices', 'templates', 'generator', 'profile', 'enterprises', 'documentsHub', 'configuration'],
  pasante: ['dashboard', 'clients', 'cases', 'documents', 'templates', 'generator', 'documentsHub'],
  secretaria: ['dashboard', 'clients', 'cases', 'agenda', 'documents', 'templates', 'profile', 'documentsHub', 'configuration'],
  contador: ['dashboard', 'payments', 'quotations', 'invoices', 'accounting', 'suppliers', 'purchases', 'sales', 'inventory', 'documentsHub', 'configuration'],
  capturista: ['dashboard', 'clients', 'cases', 'services', 'quotations', 'invoices', 'generator', 'enterprises', 'suppliers', 'purchases', 'sales', 'inventory', 'documentsHub', 'configuration'],
  trabajador: ['dashboard', 'clients', 'cases', 'agenda', 'payments', 'documents', 'matters', 'services', 'quotations', 'invoices', 'templates', 'generator', 'profile'],
  invitado: ['dashboard', 'documentsHub', 'profile']
};

const matterOptions = ['Civil', 'Familiar', 'Penal', 'Mercantil', 'Agrario', 'Amparo', 'Laboral', 'Administrativo', 'Fiscal', 'Constitucional', 'Notarial', 'Sucesorio', 'Arrendamiento', 'Tránsito y accidentes', 'Daño moral', 'Cobranza judicial', 'Cobranza extrajudicial', 'Contratos', 'Propiedad', 'Derechos humanos', 'Seguridad social', 'Municipal', 'Ejidal', 'Migratorio'];
const paymentForms = ['fijo', 'mensual', 'porcentaje', 'por etapa'];
const quoteStatuses = ['pendiente', 'aprobado', 'pagado', 'vencido', 'cancelado'];
const invoiceStatuses = ['pagado', 'parcial', 'pendiente', 'vencido'];
const invoiceMethods = ['efectivo', 'transferencia', 'tarjeta', 'depósito'];

function formatCurrency(value) {
  const number = Number(value || 0);
  return `$${number.toLocaleString('es-MX')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(date);
}

function createId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ModulePlaceholder({ title, description, areas, icon, status }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <p className="brand-label">Arquitectura empresarial</p>
          <h2>{title}</h2>
        </div>
        <span className="status-pill">{status}</span>
      </div>
      <div className="module-placeholder">
        <div className="panel">
          <div className="module-card-icon">{icon}</div>
          <p className="helper-text">{description}</p>
          <ul className="module-list">
            {areas.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="panel">
          <h3>Estado de preparación</h3>
          <p className="helper-text">Este módulo queda listo para crecer sin rehacer la estructura principal. La navegación, usuarios, permisos y documentos ya se mantienen alineados a la plataforma.</p>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [role, setRole] = useState('trabajador');
  const [section, setSection] = useState('dashboard');
  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') return defaultData;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      ...defaultData,
      ...parsed,
      matters: parsed.matters || defaultData.matters,
      services: parsed.services || defaultData.services,
      quotations: parsed.quotations || defaultData.quotations,
      invoices: parsed.invoices || defaultData.invoices,
      templates: parsed.templates || defaultData.templates,
      generatedDocuments: parsed.generatedDocuments || defaultData.generatedDocuments,
      suppliers: parsed.suppliers || defaultData.suppliers,
      inventoryItems: parsed.inventoryItems || defaultData.inventoryItems,
      purchases: parsed.purchases || defaultData.purchases,
      sales: parsed.sales || defaultData.sales,
      accountingEntries: parsed.accountingEntries || defaultData.accountingEntries,
      dispatchProfile: parsed.dispatchProfile || defaultData.dispatchProfile
    };
  });
  const [matterForm, setMatterForm] = useState({ id: null, name: '' });
  const [matterEditingId, setMatterEditingId] = useState(null);
  const [serviceForm, setServiceForm] = useState({ id: null, name: '', matter: '', description: '', basePrice: '', suggestedAdvance: '', paymentForm: 'fijo', estimatedTime: '', requiredDocuments: '', observations: '', status: 'activo' });
  const [serviceEditingId, setServiceEditingId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ id: null, clientId: '', serviceId: '', matter: '', totalPrice: '', advance: '', pendingBalance: '', additionalExpenses: '', discount: '', finalTotal: '', quoteDate: new Date().toISOString().slice(0, 10), paymentDeadline: '', status: 'pendiente', description: '' });
  const [quoteEditingId, setQuoteEditingId] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({ id: null, clientId: '', serviceId: '', concept: '', subtotal: '', discount: '', expenses: '', total: '', advance: '', balance: '', paymentMethod: 'efectivo', status: 'pendiente', date: new Date().toISOString().slice(0, 10) });
  const [invoiceEditingId, setInvoiceEditingId] = useState(null);
  const [templateForm, setTemplateForm] = useState({ id: null, name: '', matter: '', description: '', content: '' });
  const [templateEditingId, setTemplateEditingId] = useState(null);
  const [profileForm, setProfileForm] = useState(defaultData.dispatchProfile);
  const [supplierForm, setSupplierForm] = useState({ id: null, name: '', contact: '', email: '', phone: '', address: '', balance: '' });
  const [inventoryForm, setInventoryForm] = useState({ id: null, sku: '', name: '', category: 'Material', unit: 'pz', cost: '', stock: '', minStock: '', description: '' });
  const [purchaseForm, setPurchaseForm] = useState({ id: null, supplierId: '', itemId: '', quantity: '', unitCost: '', total: '', date: new Date().toISOString().slice(0, 10), dueDate: '', status: 'pendiente', notes: '' });
  const [saleForm, setSaleForm] = useState({ id: null, clientId: '', itemId: '', quantity: '', unitPrice: '', total: '', date: new Date().toISOString().slice(0, 10), status: 'pendiente', notes: '' });
  const [templateSearch, setTemplateSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFolioSearch, setInvoiceFolioSearch] = useState('');
  const [documentGenerator, setDocumentGenerator] = useState({ clientId: '', caseId: '', serviceId: '', templateId: '' });
  const [generatedText, setGeneratedText] = useState('');
  const [reportQuoteId, setReportQuoteId] = useState(data.quotations[0]?.id || '');
  const [reportDraft, setReportDraft] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const [backupFileName, setBackupFileName] = useState('proyecto-zamorano-backup.json');
  const [lastBackupAt, setLastBackupAt] = useState('');
  const [enterpriseForm, setEnterpriseForm] = useState({ id: null, name: '', rfc: '', address: '', email: '', phone: '', representative: '', status: 'activo', observations: '' });
  const [foundryForm, setFoundryForm] = useState({ id: null, client: '', product: '', quantity: '', priority: 'media', status: 'cotizada', deliveryDate: '', observations: '' });
  const [constructionForm, setConstructionForm] = useState({ id: null, name: '', client: '', budget: '', estimated: '', progress: '', status: 'planeación', observations: '' });
  const [ruizGraphicsForm, setRuizGraphicsForm] = useState({ id: null, client: '', service: '', deliveryDate: '', status: 'en revisión', observations: '' });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const storedAuth = window.localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
      const savedRole = storedAuth.split(':')[1] || 'trabajador';
      setRole(savedRole);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setProfileForm(data.dispatchProfile);
  }, [data.dispatchProfile]);

  useEffect(() => {
    if (data.quotations.length && !reportQuoteId) {
      setReportQuoteId(data.quotations[0].id);
    }
  }, [data.quotations, reportQuoteId]);

  const visibleMenu = useMemo(() => menuItems.filter((item) => (roleAccessMap[role] || []).includes(item.id)), [role]);

  const visibleModules = useMemo(() => moduleCatalog.filter((item) => (roleAccessMap[role] || []).includes(item.id)), [role]);

  const dashboardStats = useMemo(() => {
    const pendingActivities = data.agenda.filter((item) => item.status === 'pendiente').length;
    const nextMeetings = data.agenda.filter((item) => item.status === 'pendiente').slice(0, 3);
    const pendingQuotes = data.quotations.filter((item) => item.status === 'pendiente' || item.status === 'aprobado').length;
    const pendingInvoices = data.invoices.filter((item) => item.status === 'pendiente' || item.status === 'parcial').length;
    const activeServices = data.services.filter((item) => item.status === 'activo').length;
    const income = data.invoices.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const alerts = data.quotations.filter((item) => item.status === 'vencido').length + data.invoices.filter((item) => item.status === 'vencido').length;
    return {
      clients: data.clients.length,
      cases: data.cases.length,
      pendingActivities,
      nextMeetings,
      pendingQuotes,
      pendingInvoices,
      activeServices,
      income,
      alerts,
      suppliers: data.suppliers.length,
      inventoryItems: data.inventoryItems.length,
      purchases: data.purchases.length,
      sales: data.sales.length,
      enterprises: data.enterprises.length,
      foundryOrders: data.foundryOrders.length,
      constructionProjects: data.constructionProjects.length,
      graphicsOrders: data.ruizGraphicsOrders.length
    };
  }, [data]);

  const accountingSummary = useMemo(() => getAccountingSummary({ accountingEntries: data.accountingEntries }), [data.accountingEntries]);

  const filteredTemplates = useMemo(() => {
    if (!templateSearch) return data.templates;
    return data.templates.filter((item) => item.name.toLowerCase().includes(templateSearch.toLowerCase()) || item.matter.toLowerCase().includes(templateSearch.toLowerCase()));
  }, [data.templates, templateSearch]);

  const filteredInvoices = useMemo(() => {
    return data.invoices.filter((item) => {
      const clientName = data.clients.find((client) => client.id === item.clientId)?.name || '';
      return (!invoiceSearch || clientName.toLowerCase().includes(invoiceSearch.toLowerCase())) && (!invoiceFolioSearch || item.folio.toLowerCase().includes(invoiceFolioSearch.toLowerCase()));
    });
  }, [data.invoices, data.clients, invoiceSearch, invoiceFolioSearch]);

  const selectedReport = useMemo(() => data.quotations.find((item) => item.id === reportQuoteId), [data.quotations, reportQuoteId]);

  const reportContent = useMemo(() => {
    if (!selectedReport) return '';
    const client = data.clients.find((client) => client.id === selectedReport.clientId);
    const service = data.services.find((service) => service.id === selectedReport.serviceId);
    const dispatch = data.dispatchProfile;
    return `REPORTE DE COBRO\n\nDespacho: ${dispatch.name}\nAbogado responsable: ${dispatch.attorney}\nCédula: ${dispatch.professionalLicense}\nDomicilio: ${dispatch.address}\nTeléfono: ${dispatch.phone}\nCorreo: ${dispatch.email}\n\nCliente: ${client?.name || '—'}\nTeléfono: ${client?.phone || '—'}\nDomicilio: ${client?.address || '—'}\nCorreo: ${client?.email || '—'}\n\nServicio: ${service?.name || '—'}\nMateria: ${selectedReport.matter}\nDescripción: ${selectedReport.description}\nPrecio total: ${formatCurrency(selectedReport.totalPrice)}\nAnticipo: ${formatCurrency(selectedReport.advance)}\nSaldo: ${formatCurrency(selectedReport.pendingBalance)}\nGastos adicionales: ${formatCurrency(selectedReport.additionalExpenses)}\nDescuento: ${formatCurrency(selectedReport.discount)}\nTotal final: ${formatCurrency(selectedReport.finalTotal)}\nFecha: ${formatDate(selectedReport.quoteDate)}\nFecha límite: ${formatDate(selectedReport.paymentDeadline)}\nEstado: ${selectedReport.status}`;
  }, [data.clients, data.dispatchProfile, data.services, selectedReport]);

  useEffect(() => {
    setReportDraft(reportContent);
  }, [reportContent]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const normalized = credentials.username.trim().toLowerCase();
    if (normalized === 'admin' && credentials.password === '123456') {
      setRole('admin');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'admin:admin');
      setAuthError('');
    } else if (normalized === 'director' && credentials.password === '123456') {
      setRole('director');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'director:director');
      setAuthError('');
    } else if (normalized === 'oficina' && credentials.password === '123456') {
      setRole('trabajador');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'oficina:trabajador');
      setAuthError('');
    } else if (normalized === 'capturista' && credentials.password === '123456') {
      setRole('capturista');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'capturista:capturista');
      setAuthError('');
    } else if (normalized === 'abogado' && credentials.password === '123456') {
      setRole('abogado');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'abogado:abogado');
      setAuthError('');
    } else if (normalized === 'pasante' && credentials.password === '123456') {
      setRole('pasante');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'pasante:pasante');
      setAuthError('');
    } else if (normalized === 'secretaria' && credentials.password === '123456') {
      setRole('secretaria');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'secretaria:secretaria');
      setAuthError('');
    } else if (normalized === 'contador' && credentials.password === '123456') {
      setRole('contador');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'contador:contador');
      setAuthError('');
    } else if (normalized === 'invitado' && credentials.password === '123456') {
      setRole('invitado');
      setIsLoggedIn(true);
      window.localStorage.setItem(AUTH_KEY, 'invitado:invitado');
      setAuthError('');
    } else {
      setAuthError('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    window.localStorage.removeItem(AUTH_KEY);
  };

  const handleMatterSubmit = (event) => {
    event.preventDefault();
    if (matterEditingId) {
      setData((prev) => ({ ...prev, matters: prev.matters.map((item) => item === matterEditingId ? matterForm.name : item) }));
      setMatterEditingId(null);
    } else if (matterForm.name.trim()) {
      setData((prev) => ({ ...prev, matters: [...prev.matters, matterForm.name.trim()] }));
    }
    setMatterForm({ id: null, name: '' });
  };

  const handleMatterEdit = (matter) => {
    setMatterEditingId(matter);
    setMatterForm({ id: matter, name: matter });
  };

  const handleMatterDelete = (matter) => {
    if (window.confirm('¿Eliminar esta materia?')) {
      setData((prev) => ({ ...prev, matters: prev.matters.filter((item) => item !== matter) }));
    }
  };

  const handleServiceSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...serviceForm,
      basePrice: Number(serviceForm.basePrice),
      suggestedAdvance: Number(serviceForm.suggestedAdvance)
    };
    if (serviceEditingId) {
      setData((prev) => ({ ...prev, services: prev.services.map((item) => item.id === serviceEditingId ? { ...item, ...payload } : item) }));
      setServiceEditingId(null);
    } else {
      setData((prev) => ({ ...prev, services: [{ ...payload, id: createId('service') }, ...prev.services] }));
    }
    setServiceForm({ id: null, name: '', matter: '', description: '', basePrice: '', suggestedAdvance: '', paymentForm: 'fijo', estimatedTime: '', requiredDocuments: '', observations: '', status: 'activo' });
  };

  const handleServiceEdit = (service) => {
    setServiceEditingId(service.id);
    setServiceForm(service);
  };

  const handleServiceDelete = (id) => {
    if (window.confirm('¿Eliminar este servicio?')) {
      setData((prev) => ({ ...prev, services: prev.services.filter((item) => item.id !== id) }));
    }
  };

  const handleQuoteSubmit = (event) => {
    event.preventDefault();
    const service = data.services.find((item) => item.id === quoteForm.serviceId);
    const total = Number(quoteForm.totalPrice || 0);
    const discount = Number(quoteForm.discount || 0);
    const expenses = Number(quoteForm.additionalExpenses || 0);
    const finalTotal = total + expenses - discount;
    const pendingBalance = Math.max(finalTotal - Number(quoteForm.advance || 0), 0);
    const payload = {
      ...quoteForm,
      totalPrice: Number(quoteForm.totalPrice || 0),
      advance: Number(quoteForm.advance || 0),
      pendingBalance,
      additionalExpenses: expenses,
      discount,
      finalTotal,
      matter: service?.matter || quoteForm.matter,
      description: quoteForm.description || service?.description || ''
    };
    if (quoteEditingId) {
      setData((prev) => ({ ...prev, quotations: prev.quotations.map((item) => item.id === quoteEditingId ? { ...item, ...payload } : item) }));
      setQuoteEditingId(null);
    } else {
      setData((prev) => ({ ...prev, quotations: [{ ...payload, id: createId('quote') }, ...prev.quotations] }));
    }
    setQuoteForm({ id: null, clientId: '', serviceId: '', matter: '', totalPrice: '', advance: '', pendingBalance: '', additionalExpenses: '', discount: '', finalTotal: '', quoteDate: new Date().toISOString().slice(0, 10), paymentDeadline: '', status: 'pendiente', description: '' });
  };

  const handleQuoteEdit = (quote) => {
    setQuoteEditingId(quote.id);
    setQuoteForm(quote);
  };

  const handleQuoteDelete = (id) => {
    if (window.confirm('¿Eliminar esta cotización?')) {
      setData((prev) => ({ ...prev, quotations: prev.quotations.filter((item) => item.id !== id) }));
    }
  };

  const handleInvoiceSubmit = (event) => {
    event.preventDefault();
    const subtotal = Number(invoiceForm.subtotal || 0);
    const discount = Number(invoiceForm.discount || 0);
    const expenses = Number(invoiceForm.expenses || 0);
    const total = subtotal + expenses - discount;
    const balance = Math.max(total - Number(invoiceForm.advance || 0), 0);
    const payload = {
      ...invoiceForm,
      subtotal,
      discount,
      expenses,
      total,
      advance: Number(invoiceForm.advance || 0),
      balance,
      folio: invoiceForm.id ? (data.invoices.find((item) => item.id === invoiceForm.id)?.folio || '') : `REC-${new Date(invoiceForm.date).toISOString().slice(0, 10).replace(/-/g, '')}-${String(data.invoices.length + 1).padStart(3, '0')}`
    };
    if (invoiceEditingId) {
      setData((prev) => ({ ...prev, invoices: prev.invoices.map((item) => item.id === invoiceEditingId ? { ...item, ...payload } : item) }));
      setInvoiceEditingId(null);
    } else {
      setData((prev) => ({ ...prev, invoices: [{ ...payload, id: createId('invoice') }, ...prev.invoices] }));
    }
    setInvoiceForm({ id: null, clientId: '', serviceId: '', concept: '', subtotal: '', discount: '', expenses: '', total: '', advance: '', balance: '', paymentMethod: 'efectivo', status: 'pendiente', date: new Date().toISOString().slice(0, 10) });
  };

  const handleInvoiceEdit = (invoice) => {
    setInvoiceEditingId(invoice.id);
    setInvoiceForm(invoice);
  };

  const handleInvoiceDelete = (id) => {
    if (window.confirm('¿Eliminar este comprobante?')) {
      setData((prev) => ({ ...prev, invoices: prev.invoices.filter((item) => item.id !== id) }));
    }
  };

  const handlePrintInvoice = (invoice) => {
    const client = data.clients.find((item) => item.id === invoice.clientId);
    const service = data.services.find((item) => item.id === invoice.serviceId);
    const content = `RECIBO INTERNO\n\nFolio: ${invoice.folio}\nFecha: ${formatDate(invoice.date)}\n\nDespacho: ${data.dispatchProfile.name}\nAbogado: ${data.dispatchProfile.attorney}\n\nCliente: ${client?.name || '—'}\nServicio: ${service?.name || '—'}\nConcepto: ${invoice.concept}\nSubtotal: ${formatCurrency(invoice.subtotal)}\nDescuento: ${formatCurrency(invoice.discount)}\nGastos: ${formatCurrency(invoice.expenses)}\nTotal: ${formatCurrency(invoice.total)}\nAnticipo: ${formatCurrency(invoice.advance)}\nSaldo: ${formatCurrency(invoice.balance)}\nMétodo de pago: ${invoice.paymentMethod}\nEstado: ${invoice.status}`;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`<pre>${content}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadInvoice = (invoice) => {
    const client = data.clients.find((item) => item.id === invoice.clientId);
    const service = data.services.find((item) => item.id === invoice.serviceId);
    const content = `RECIBO INTERNO\nFolio: ${invoice.folio}\nFecha: ${formatDate(invoice.date)}\nCliente: ${client?.name || '—'}\nServicio: ${service?.name || '—'}\nTotal: ${formatCurrency(invoice.total)}\nAnticipo: ${formatCurrency(invoice.advance)}\nSaldo: ${formatCurrency(invoice.balance)}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${invoice.folio}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleTemplateSubmit = (event) => {
    event.preventDefault();
    const payload = { ...templateForm };
    if (templateEditingId) {
      setData((prev) => ({ ...prev, templates: prev.templates.map((item) => item.id === templateEditingId ? { ...item, ...payload } : item) }));
      setTemplateEditingId(null);
    } else {
      setData((prev) => ({ ...prev, templates: [{ ...payload, id: createId('template') }, ...prev.templates] }));
    }
    setTemplateForm({ id: null, name: '', matter: '', description: '', content: '' });
  };

  const handleTemplateEdit = (template) => {
    setTemplateEditingId(template.id);
    setTemplateForm(template);
  };

  const handleTemplateDelete = (id) => {
    if (window.confirm('¿Eliminar este machote?')) {
      setData((prev) => ({ ...prev, templates: prev.templates.filter((item) => item.id !== id) }));
    }
  };

  const handleDuplicateTemplate = (template) => {
    const duplicated = { ...template, id: createId('template'), name: `${template.name} copia` };
    setData((prev) => ({ ...prev, templates: [duplicated, ...prev.templates] }));
  };

  const handleEnterpriseSubmit = (event) => {
    event.preventDefault();
    if (enterpriseForm.id) {
      setData((prev) => ({ ...prev, enterprises: prev.enterprises.map((item) => item.id === enterpriseForm.id ? { ...item, ...enterpriseForm } : item) }));
    } else {
      setData((prev) => ({ ...prev, enterprises: [{ ...enterpriseForm, id: createId('enterprise') }, ...prev.enterprises] }));
    }
    setEnterpriseForm({ id: null, name: '', rfc: '', address: '', email: '', phone: '', representative: '', status: 'activo', observations: '' });
  };

  const handleEnterpriseEdit = (enterprise) => {
    setEnterpriseForm(enterprise);
  };

  const handleEnterpriseDelete = (id) => {
    if (window.confirm('¿Eliminar esta empresa?')) {
      setData((prev) => ({ ...prev, enterprises: prev.enterprises.filter((item) => item.id !== id) }));
    }
  };

  const handleFoundrySubmit = (event) => {
    event.preventDefault();
    if (foundryForm.id) {
      setData((prev) => ({ ...prev, foundryOrders: prev.foundryOrders.map((item) => item.id === foundryForm.id ? { ...item, ...foundryForm, quantity: Number(foundryForm.quantity || 0) } : item) }));
    } else {
      setData((prev) => ({ ...prev, foundryOrders: [{ ...foundryForm, id: createId('foundry'), quantity: Number(foundryForm.quantity || 0) }, ...prev.foundryOrders] }));
    }
    setFoundryForm({ id: null, client: '', product: '', quantity: '', priority: 'media', status: 'cotizada', deliveryDate: '', observations: '' });
  };

  const handleFoundryEdit = (order) => {
    setFoundryForm(order);
  };

  const handleFoundryDelete = (id) => {
    if (window.confirm('¿Eliminar esta orden?')) {
      setData((prev) => ({ ...prev, foundryOrders: prev.foundryOrders.filter((item) => item.id !== id) }));
    }
  };

  const handleConstructionSubmit = (event) => {
    event.preventDefault();
    if (constructionForm.id) {
      setData((prev) => ({ ...prev, constructionProjects: prev.constructionProjects.map((item) => item.id === constructionForm.id ? { ...item, ...constructionForm, budget: Number(constructionForm.budget || 0), estimated: Number(constructionForm.estimated || 0), progress: Number(constructionForm.progress || 0) } : item) }));
    } else {
      setData((prev) => ({ ...prev, constructionProjects: [{ ...constructionForm, id: createId('construction'), budget: Number(constructionForm.budget || 0), estimated: Number(constructionForm.estimated || 0), progress: Number(constructionForm.progress || 0) }, ...prev.constructionProjects] }));
    }
    setConstructionForm({ id: null, name: '', client: '', budget: '', estimated: '', progress: '', status: 'planeación', observations: '' });
  };

  const handleConstructionEdit = (project) => {
    setConstructionForm(project);
  };

  const handleConstructionDelete = (id) => {
    if (window.confirm('¿Eliminar este proyecto?')) {
      setData((prev) => ({ ...prev, constructionProjects: prev.constructionProjects.filter((item) => item.id !== id) }));
    }
  };

  const handleRuizGraphicsSubmit = (event) => {
    event.preventDefault();
    if (ruizGraphicsForm.id) {
      setData((prev) => ({ ...prev, ruizGraphicsOrders: prev.ruizGraphicsOrders.map((item) => item.id === ruizGraphicsForm.id ? { ...item, ...ruizGraphicsForm } : item) }));
    } else {
      setData((prev) => ({ ...prev, ruizGraphicsOrders: [{ ...ruizGraphicsForm, id: createId('ruizgraphics') }, ...prev.ruizGraphicsOrders] }));
    }
    setRuizGraphicsForm({ id: null, client: '', service: '', deliveryDate: '', status: 'en revisión', observations: '' });
  };

  const handleRuizGraphicsEdit = (order) => {
    setRuizGraphicsForm(order);
  };

  const handleRuizGraphicsDelete = (id) => {
    if (window.confirm('¿Eliminar este pedido?')) {
      setData((prev) => ({ ...prev, ruizGraphicsOrders: prev.ruizGraphicsOrders.filter((item) => item.id !== id) }));
    }
  };

  const handleSupplierSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...supplierForm,
      balance: Number(supplierForm.balance || 0)
    };
    if (supplierForm.id) {
      setData((prev) => ({ ...prev, suppliers: prev.suppliers.map((item) => item.id === supplierForm.id ? { ...item, ...payload } : item) }));
    } else {
      setData((prev) => ({ ...prev, suppliers: [{ ...payload, id: createId('supplier') }, ...prev.suppliers] }));
    }
    setSupplierForm({ id: null, name: '', contact: '', email: '', phone: '', address: '', balance: '' });
  };

  const handleSupplierEdit = (supplier) => {
    setSupplierForm(supplier);
  };

  const handleSupplierDelete = (id) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      setData((prev) => ({ ...prev, suppliers: prev.suppliers.filter((item) => item.id !== id) }));
    }
  };

  const handleInventorySubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...inventoryForm,
      cost: Number(inventoryForm.cost || 0),
      stock: Number(inventoryForm.stock || 0),
      minStock: Number(inventoryForm.minStock || 0)
    };
    if (inventoryForm.id) {
      setData((prev) => ({ ...prev, inventoryItems: prev.inventoryItems.map((item) => item.id === inventoryForm.id ? { ...item, ...payload } : item) }));
    } else {
      setData((prev) => ({ ...prev, inventoryItems: [{ ...payload, id: createId('item') }, ...prev.inventoryItems] }));
    }
    setInventoryForm({ id: null, sku: '', name: '', category: 'Material', unit: 'pz', cost: '', stock: '', minStock: '', description: '' });
  };

  const handleInventoryEdit = (item) => {
    setInventoryForm(item);
  };

  const handleInventoryDelete = (id) => {
    if (window.confirm('¿Eliminar este producto del inventario?')) {
      setData((prev) => ({ ...prev, inventoryItems: prev.inventoryItems.filter((item) => item.id !== id) }));
    }
  };

  const handlePurchaseSubmit = (event) => {
    event.preventDefault();
    const quantity = Number(purchaseForm.quantity || 0);
    const unitCost = Number(purchaseForm.unitCost || 0);
    const total = Number(purchaseForm.total || quantity * unitCost);
    const payload = { ...purchaseForm, quantity, unitCost, total, date: purchaseForm.date || new Date().toISOString().slice(0, 10) };
    if (!payload.supplierId || !payload.itemId) {
      alert('Seleccione proveedor y producto para registrar la compra.');
      return;
    }
    if (purchaseForm.id) {
      setData((prev) => ({ ...prev, purchases: prev.purchases.map((item) => item.id === purchaseForm.id ? { ...item, ...payload } : item) }));
    } else {
      const transaction = applyPurchaseTransaction({
        purchase: payload,
        inventoryItems: data.inventoryItems,
        suppliers: data.suppliers,
        accountingEntries: data.accountingEntries
      });
      setData((prev) => ({
        ...prev,
        inventoryItems: transaction.inventoryItems,
        suppliers: transaction.suppliers,
        accountingEntries: transaction.accountingEntries,
        purchases: [{ ...payload, id: createId('purchase') }, ...prev.purchases]
      }));
    }
    setPurchaseForm({ id: null, supplierId: '', itemId: '', quantity: '', unitCost: '', total: '', date: new Date().toISOString().slice(0, 10), dueDate: '', status: 'pendiente', notes: '' });
  };

  const handlePurchaseEdit = (purchase) => {
    setPurchaseForm(purchase);
  };

  const handlePurchaseDelete = (id) => {
    if (window.confirm('¿Eliminar esta compra?')) {
      setData((prev) => ({ ...prev, purchases: prev.purchases.filter((item) => item.id !== id) }));
    }
  };

  const handleSaleSubmit = (event) => {
    event.preventDefault();
    const quantity = Number(saleForm.quantity || 0);
    const unitPrice = Number(saleForm.unitPrice || 0);
    const total = Number(saleForm.total || quantity * unitPrice);
    const payload = { ...saleForm, quantity, unitPrice, total, date: saleForm.date || new Date().toISOString().slice(0, 10) };
    if (!payload.clientId || !payload.itemId) {
      alert('Seleccione cliente y producto para registrar la venta.');
      return;
    }
    const currentItem = data.inventoryItems.find((item) => item.id === payload.itemId);
    if (currentItem && currentItem.stock < quantity) {
      alert('No hay suficiente inventario para completar esta venta.');
      return;
    }
    if (saleForm.id) {
      setData((prev) => ({ ...prev, sales: prev.sales.map((item) => item.id === saleForm.id ? { ...item, ...payload } : item) }));
    } else {
      const transaction = applySalesTransaction({
        sale: payload,
        inventoryItems: data.inventoryItems,
        clients: data.clients,
        accountingEntries: data.accountingEntries
      });
      setData((prev) => ({
        ...prev,
        inventoryItems: transaction.inventoryItems,
        clients: transaction.clients,
        accountingEntries: transaction.accountingEntries,
        sales: [{ ...payload, id: createId('sale') }, ...prev.sales]
      }));
    }
    setSaleForm({ id: null, clientId: '', itemId: '', quantity: '', unitPrice: '', total: '', date: new Date().toISOString().slice(0, 10), status: 'pendiente', notes: '' });
  };

  const handleSaleEdit = (sale) => {
    setSaleForm(sale);
  };

  const handleSaleDelete = (id) => {
    if (window.confirm('¿Eliminar esta venta?')) {
      setData((prev) => ({ ...prev, sales: prev.sales.filter((item) => item.id !== id) }));
    }
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setData((prev) => ({ ...prev, dispatchProfile: profileForm }));
  };

  const handleGenerateDocument = (event) => {
    event.preventDefault();
    const client = data.clients.find((item) => item.id === documentGenerator.clientId);
    const caseItem = data.cases.find((item) => item.id === documentGenerator.caseId);
    const service = data.services.find((item) => item.id === documentGenerator.serviceId);
    const template = data.templates.find((item) => item.id === documentGenerator.templateId);
    const profile = data.dispatchProfile;
    const documentText = (template?.content || '')
      .replace(/{{nombre_cliente}}/g, client?.name || 'Nombre del cliente')
      .replace(/{{domicilio_cliente}}/g, client?.address || 'Domicilio')
      .replace(/{{telefono_cliente}}/g, client?.phone || 'Teléfono')
      .replace(/{{correo_cliente}}/g, client?.email || 'Correo')
      .replace(/{{nombre_despacho}}/g, profile.name)
      .replace(/{{abogado_responsable}}/g, profile.attorney)
      .replace(/{{cedula_profesional}}/g, profile.professionalLicense)
      .replace(/{{fecha}}/g, new Date().toLocaleDateString('es-MX'))
      .replace(/{{servicio}}/g, service?.name || 'Servicio')
      .replace(/{{precio_total}}/g, formatCurrency(service?.basePrice || 0))
      .replace(/{{anticipo}}/g, formatCurrency(service?.suggestedAdvance || 0))
      .replace(/{{saldo}}/g, formatCurrency(Math.max((service?.basePrice || 0) - (service?.suggestedAdvance || 0), 0)))
      .replace(/{{expediente}}/g, caseItem?.caseNumber || 'Sin expediente');
    setGeneratedText(documentText);
  };

  const handleSaveGeneratedDocument = () => {
    if (!generatedText) return;
    setData((prev) => ({ ...prev, generatedDocuments: [{ id: createId('generated'), text: generatedText, createdAt: new Date().toISOString() }, ...prev.generatedDocuments] }));
    alert('Documento guardado en el historial local.');
  };

  const handlePrintDocument = () => {
    if (!generatedText) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`<pre>${generatedText}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadDocument = () => {
    if (!generatedText) return;
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento-generado.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportBackup = () => {
    const exportedAt = new Date().toISOString();
    const payload = createBackupBlob(data, exportedAt);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(payload);
    link.download = backupFileName || 'proyecto-zamorano-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setLastBackupAt(exportedAt);
    setBackupStatus('Respaldo exportado correctamente.');
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const restored = importBackupFromText(text);
      setData((prev) => ({ ...prev, ...restored.data }));
      setLastBackupAt(restored.exportedAt || '');
      setBackupStatus(`Respaldo importado desde ${file.name}.`);
      if (window.confirm('¿Deseas reemplazar los datos actuales con el respaldo importado?')) {
        setData(restored.data);
      }
    } catch (error) {
      setBackupStatus(error.message || 'No se pudo importar el respaldo.');
    }
  };

  const handlePrepareDbMigration = () => {
    const summary = {
      app: 'Proyecto Zamorano',
      targetDatabase: 'PostgreSQL',
      entities: ['clients', 'cases', 'agenda', 'payments', 'documents', 'matters', 'services', 'quotations', 'invoices', 'templates', 'generatedDocuments', 'dispatchProfile'],
      notes: 'El formato actual está preparado para migrar a PostgreSQL mediante una tabla por entidad o un modelo JSONB.'
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'proyecto-zamorano-migracion-postgresql.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setBackupStatus('Plan de migración preparado para PostgreSQL.');
  };

  const backupWarning = getBackupWarningState(lastBackupAt);
  const canManageCatalog = ['admin', 'director', 'abogado'].includes(role);
  const canCreateOfficeDocs = ['admin', 'director', 'trabajador', 'capturista', 'abogado', 'secretaria'].includes(role);

  return (
    <div className="app-shell">
      {!isLoggedIn ? (
        <div className="login-screen">
          <div className="login-card">
            <div className="brand-block">
              <div className="brand-icon">⚖️</div>
              <div>
                <p className="brand-label">Sistema interno</p>
                <h1>Proyecto Zamorano</h1>
              </div>
            </div>
            <p className="login-copy">Ingrese con su cuenta para operar la plataforma empresarial desde un único centro de control.</p>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <label>Usuario<input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} placeholder="admin" /></label>
              <label>Contraseña<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="123456" /></label>
              {authError ? <p className="error-text">{authError}</p> : null}
              <button type="submit">Ingresar</button>
            </form>
            <p className="hint-text">Accesos demo: admin, director, oficina, capturista, abogado, pasante, secretaria, contador, invitado · contraseña: 123456</p>
          </div>
        </div>
      ) : (
        <>
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="brand-icon">⚖️</div>
              <div>
                <p className="brand-label">Despacho jurídico</p>
                <h2>Proyecto Zamorano</h2>
              </div>
            </div>
            <div className="role-pill">Rol: {role}</div>
            <nav className="sidebar-nav">
              {visibleMenu.map((item) => (
                <button key={item.id} className={section === item.id ? 'nav-btn active' : 'nav-btn'} onClick={() => setSection(item.id)}>{item.label}</button>
              ))}
            </nav>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <div>
                <p className="brand-label">Bienvenido</p>
                <h3>{menuItems.find((item) => item.id === section)?.label}</h3>
              </div>
              <div className="topbar-pill">Gestión interna del despacho</div>
            </header>

            {section === 'dashboard' && (
              <section className="section-card">
                <div className="section-head">
                  <div>
                    <p className="brand-label">Centro de control</p>
                    <h2>Plataforma empresarial modular</h2>
                  </div>
                  <div className="topbar-pill">Rol: {role}</div>
                </div>
                <div className="stats-grid">
                  <article className="stat-card"><span>Actividades pendientes</span><strong>{dashboardStats.pendingActivities}</strong></article>
                  <article className="stat-card"><span>Próximas reuniones</span><strong>{dashboardStats.nextMeetings.length}</strong></article>
                  <article className="stat-card"><span>Cobros pendientes</span><strong>{dashboardStats.pendingQuotes}</strong></article>
                  <article className="stat-card"><span>Ingresos</span><strong>{formatCurrency(dashboardStats.income)}</strong></article>
                  <article className="stat-card"><span>Notificaciones</span><strong>{dashboardStats.pendingInvoices}</strong></article>
                  <article className="stat-card"><span>Alertas importantes</span><strong>{dashboardStats.alerts}</strong></article>
                </div>
                <div className="dashboard-grid">
                  <div className="panel">
                    <h3>Resumen ejecutivo</h3>
                    <ul className="item-list">
                      <li><span>Clientes registrados</span><strong>{dashboardStats.clients}</strong></li>
                      <li><span>Expedientes activos</span><strong>{dashboardStats.cases}</strong></li>
                      <li><span>Servicios activos</span><strong>{dashboardStats.activeServices}</strong></li>
                      <li><span>Recibos pendientes</span><strong>{dashboardStats.pendingInvoices}</strong></li>
                    </ul>
                  </div>
                  <div className="panel">
                    <h3>Módulos disponibles</h3>
                    <p className="helper-text">Cada módulo comparte usuarios, permisos, configuración, documentos y base de datos, pero funciona de forma independiente.</p>
                    <div className="module-grid">
                      {visibleModules.map((module) => (
                        <article key={module.id} className="module-card">
                          <div className="module-card-icon">{module.icon}</div>
                          <div className="module-card-header">
                            <h3>{module.label}</h3>
                            <span className="status-pill">{module.status}</span>
                          </div>
                          <p>{module.description}</p>
                          <button type="button" className="nav-btn" onClick={() => setSection(module.target || module.id)}>Entrar</button>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {section === 'enterprises' && <ModulePlaceholder title="Empresas" description="Centro administrativo de todas las empresas del grupo y futuras sociedades." areas={['Registro de empresas', 'Logotipos y datos legales', 'Representantes y observaciones', 'Estado y seguimiento general']} icon="🏢" status="Arquitectura preparada" />}
            {section === 'foundry' && <ModulePlaceholder title="Herrería" description="Administración de clientes, cotizaciones, materiales, producción, órdenes y entregas." areas={['Cotizaciones y órdenes de trabajo', 'Inventario y producción', 'Soldadura, cortes y entregas', 'Control operativo por proyecto']} icon="🔨" status="Arquitectura preparada" />}
            {section === 'construction' && <ModulePlaceholder title="Construcción" description="Gestión operativa de obras, presupuestos, estimaciones, personales y bitácoras." areas={['Obras y presupuestos', 'Estimaciones y avances', 'Personal y materiales', 'Bitácoras y seguimiento']} icon="🏗️" status="Arquitectura preparada" />}
            {section === 'ruizgraphics' && <ModulePlaceholder title="Ruiz Graphics" description="Módulo visual para diseño, impresión, gran formato, bordados y producción." areas={['Diseño gráfico y pedidos', 'Impresión y producción', 'Gran formato y serigrafía', 'Sublimación y entregas']} icon="🎨" status="Arquitectura preparada" />}
            {section === 'suppliers' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Proveedores</p><h2>Registro y seguimiento de proveedores</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Agregar o editar proveedor</h3>
                    <form className="form-grid" onSubmit={handleSupplierSubmit}>
                      <label>Nombre<input value={supplierForm.name} onChange={(event) => setSupplierForm({ ...supplierForm, name: event.target.value })} required /></label>
                      <label>Contacto<input value={supplierForm.contact} onChange={(event) => setSupplierForm({ ...supplierForm, contact: event.target.value })} /></label>
                      <label>Correo<input value={supplierForm.email} onChange={(event) => setSupplierForm({ ...supplierForm, email: event.target.value })} /></label>
                      <label>Teléfono<input value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} /></label>
                      <label>Domicilio<input value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} /></label>
                      <label>Saldo inicial<input type="number" value={supplierForm.balance} onChange={(event) => setSupplierForm({ ...supplierForm, balance: event.target.value })} /></label>
                      <div className="actions-row full-width"><button type="submit">{supplierForm.id ? 'Guardar proveedor' : 'Agregar proveedor'}</button>{supplierForm.id ? <button type="button" className="secondary-btn" onClick={() => setSupplierForm({ id: null, name: '', contact: '', email: '', phone: '', address: '', balance: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Proveedores activos</h3>
                    <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Contacto</th><th>Saldo</th><th>Acciones</th></tr></thead><tbody>{data.suppliers.map((supplier) => <tr key={supplier.id}><td>{supplier.name}</td><td>{supplier.contact}</td><td>{formatCurrency(supplier.balance)}</td><td><button className="table-btn" onClick={() => handleSupplierEdit(supplier)}>Editar</button><button className="table-btn danger" onClick={() => handleSupplierDelete(supplier.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}
            {section === 'purchases' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Compras</p><h2>Registro de compras integrado con inventario y cuentas por pagar</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Registrar compra</h3>
                    <form className="form-grid" onSubmit={handlePurchaseSubmit}>
                      <label>Proveedor<select value={purchaseForm.supplierId} onChange={(event) => setPurchaseForm({ ...purchaseForm, supplierId: event.target.value })} required><option value="">Seleccione</option>{data.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
                      <label>Producto<select value={purchaseForm.itemId} onChange={(event) => setPurchaseForm({ ...purchaseForm, itemId: event.target.value })} required><option value="">Seleccione</option>{data.inventoryItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label>Cantidad<input type="number" value={purchaseForm.quantity} onChange={(event) => setPurchaseForm({ ...purchaseForm, quantity: event.target.value })} required /></label>
                      <label>Costo unitario<input type="number" value={purchaseForm.unitCost} onChange={(event) => setPurchaseForm({ ...purchaseForm, unitCost: event.target.value })} required /></label>
                      <label>Total<input type="number" value={purchaseForm.total} onChange={(event) => setPurchaseForm({ ...purchaseForm, total: event.target.value })} /></label>
                      <label>Fecha<input type="date" value={purchaseForm.date} onChange={(event) => setPurchaseForm({ ...purchaseForm, date: event.target.value })} /></label>
                      <label>Vencimiento<input type="date" value={purchaseForm.dueDate} onChange={(event) => setPurchaseForm({ ...purchaseForm, dueDate: event.target.value })} /></label>
                      <label>Estado<select value={purchaseForm.status} onChange={(event) => setPurchaseForm({ ...purchaseForm, status: event.target.value })}><option value="pendiente">Pendiente</option><option value="recepcionada">Recepcionada</option><option value="pagada">Pagada</option></select></label>
                      <label className="full-width">Notas<textarea value={purchaseForm.notes} onChange={(event) => setPurchaseForm({ ...purchaseForm, notes: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{purchaseForm.id ? 'Guardar compra' : 'Registrar compra'}</button>{purchaseForm.id ? <button type="button" className="secondary-btn" onClick={() => setPurchaseForm({ id: null, supplierId: '', itemId: '', quantity: '', unitCost: '', total: '', date: new Date().toISOString().slice(0, 10), dueDate: '', status: 'pendiente', notes: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Historial de compras</h3>
                    <div className="table-wrap"><table><thead><tr><th>Proveedor</th><th>Producto</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.purchases.map((purchase) => <tr key={purchase.id}><td>{data.suppliers.find((supplier) => supplier.id === purchase.supplierId)?.name || '—'}</td><td>{data.inventoryItems.find((item) => item.id === purchase.itemId)?.name || '—'}</td><td>{formatCurrency(purchase.total)}</td><td>{purchase.status}</td><td><button className="table-btn" onClick={() => handlePurchaseEdit(purchase)}>Editar</button><button className="table-btn danger" onClick={() => handlePurchaseDelete(purchase.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}
            {section === 'sales' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Ventas</p><h2>Registro de ventas integrado con inventario, clientes e ingresos</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Registrar venta</h3>
                    <form className="form-grid" onSubmit={handleSaleSubmit}>
                      <label>Cliente<select value={saleForm.clientId} onChange={(event) => setSaleForm({ ...saleForm, clientId: event.target.value })} required><option value="">Seleccione</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                      <label>Producto<select value={saleForm.itemId} onChange={(event) => setSaleForm({ ...saleForm, itemId: event.target.value })} required><option value="">Seleccione</option>{data.inventoryItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label>Cantidad<input type="number" value={saleForm.quantity} onChange={(event) => setSaleForm({ ...saleForm, quantity: event.target.value })} required /></label>
                      <label>Precio unitario<input type="number" value={saleForm.unitPrice} onChange={(event) => setSaleForm({ ...saleForm, unitPrice: event.target.value })} required /></label>
                      <label>Total<input type="number" value={saleForm.total} onChange={(event) => setSaleForm({ ...saleForm, total: event.target.value })} /></label>
                      <label>Fecha<input type="date" value={saleForm.date} onChange={(event) => setSaleForm({ ...saleForm, date: event.target.value })} /></label>
                      <label>Estado<select value={saleForm.status} onChange={(event) => setSaleForm({ ...saleForm, status: event.target.value })}><option value="pendiente">Pendiente</option><option value="cobrada">Cobrada</option><option value="cancelada">Cancelada</option></select></label>
                      <label className="full-width">Notas<textarea value={saleForm.notes} onChange={(event) => setSaleForm({ ...saleForm, notes: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{saleForm.id ? 'Guardar venta' : 'Registrar venta'}</button>{saleForm.id ? <button type="button" className="secondary-btn" onClick={() => setSaleForm({ id: null, clientId: '', itemId: '', quantity: '', unitPrice: '', total: '', date: new Date().toISOString().slice(0, 10), status: 'pendiente', notes: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Ventas registradas</h3>
                    <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Producto</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.sales.map((sale) => <tr key={sale.id}><td>{data.clients.find((client) => client.id === sale.clientId)?.name || '—'}</td><td>{data.inventoryItems.find((item) => item.id === sale.itemId)?.name || '—'}</td><td>{formatCurrency(sale.total)}</td><td>{sale.status}</td><td><button className="table-btn" onClick={() => handleSaleEdit(sale)}>Editar</button><button className="table-btn danger" onClick={() => handleSaleDelete(sale.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}
            {section === 'inventory' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Inventario</p><h2>Control de existencias y costos</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Agregar o editar producto</h3>
                    <form className="form-grid" onSubmit={handleInventorySubmit}>
                      <label>SKU<input value={inventoryForm.sku} onChange={(event) => setInventoryForm({ ...inventoryForm, sku: event.target.value })} required /></label>
                      <label>Nombre<input value={inventoryForm.name} onChange={(event) => setInventoryForm({ ...inventoryForm, name: event.target.value })} required /></label>
                      <label>Categoría<input value={inventoryForm.category} onChange={(event) => setInventoryForm({ ...inventoryForm, category: event.target.value })} /></label>
                      <label>Unidad<input value={inventoryForm.unit} onChange={(event) => setInventoryForm({ ...inventoryForm, unit: event.target.value })} /></label>
                      <label>Costo<input type="number" value={inventoryForm.cost} onChange={(event) => setInventoryForm({ ...inventoryForm, cost: event.target.value })} /></label>
                      <label>Stock<input type="number" value={inventoryForm.stock} onChange={(event) => setInventoryForm({ ...inventoryForm, stock: event.target.value })} /></label>
                      <label>Stock mínimo<input type="number" value={inventoryForm.minStock} onChange={(event) => setInventoryForm({ ...inventoryForm, minStock: event.target.value })} /></label>
                      <label className="full-width">Descripción<textarea value={inventoryForm.description} onChange={(event) => setInventoryForm({ ...inventoryForm, description: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{inventoryForm.id ? 'Guardar producto' : 'Agregar producto'}</button>{inventoryForm.id ? <button type="button" className="secondary-btn" onClick={() => setInventoryForm({ id: null, sku: '', name: '', category: 'Material', unit: 'pz', cost: '', stock: '', minStock: '', description: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Catálogo de inventario</h3>
                    <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Nombre</th><th>Stock</th><th>Costo</th><th>Acciones</th></tr></thead><tbody>{data.inventoryItems.map((item) => <tr key={item.id}><td>{item.sku}</td><td>{item.name}</td><td>{item.stock}</td><td>{formatCurrency(item.cost)}</td><td><button className="table-btn" onClick={() => handleInventoryEdit(item)}>Editar</button><button className="table-btn danger" onClick={() => handleInventoryDelete(item.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}
            {section === 'accounting' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Contabilidad básica</p><h2>Resumen financiero y movimientos registrados</h2></div></div>
                <div className="stats-grid">
                  <article className="stat-card"><span>Ingresos</span><strong>{formatCurrency(accountingSummary.income)}</strong></article>
                  <article className="stat-card"><span>Cuentas por pagar</span><strong>{formatCurrency(accountingSummary.payable)}</strong></article>
                  <article className="stat-card"><span>Cuentas por cobrar</span><strong>{formatCurrency(accountingSummary.receivable)}</strong></article>
                  <article className="stat-card"><span>Saldo</span><strong>{formatCurrency(accountingSummary.balance)}</strong></article>
                </div>
                <div className="panel">
                  <h3>Movimientos contables</h3>
                  <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead><tbody>{data.accountingEntries.map((entry) => <tr key={entry.id}><td>{formatDate(entry.date)}</td><td>{entry.type}</td><td>{entry.description}</td><td>{formatCurrency(entry.amount)}</td></tr>)}</tbody></table></div>
                </div>
              </section>
            )}
            {section === 'administration' && <ModulePlaceholder title="Administración" description="Indicadores, productividad, agenda empresarial, estadísticas y metas." areas={['Indicadores y productividad', 'Planeación y metas', 'Agenda empresarial', 'Estadísticas de rendimiento']} icon="🧭" status="Arquitectura preparada" />}
            {section === 'hr' && <ModulePlaceholder title="Recursos humanos" description="Administración del talento y operaciones del personal del grupo." areas={['Trabajadores y abogados', 'Asistencia y salarios', 'Comisiones y evaluaciones', 'Contratos laborales']} icon="👥" status="Arquitectura preparada" />}
            {section === 'documentsHub' && <ModulePlaceholder title="Documentos" description="Repositorio central de contratos, PDF, imágenes, videos, recibos y plantillas." areas={['Contratos y convenios', 'PDF e imágenes', 'Recibos y facturas', 'Plantillas y archivos']} icon="📁" status="Arquitectura preparada" />}
            {section === 'ai' && <ModulePlaceholder title="Inteligencia artificial" description="Asistente empresarial preparado para resumir, generar y analizar contenido." areas={['Resumen de documentos', 'Generar escritos y contratos', 'Responder preguntas y analizar costos', 'Reportes y acompañamiento']} icon="🤖" status="Arquitectura preparada" />}
            {section === 'configuration' && <ModulePlaceholder title="Configuración" description="Administración central de usuarios, roles, permisos, seguridad y temas visuales." areas={['Usuarios y roles', 'Permisos y seguridad', 'Respaldos y preferencias', 'Información fiscal y logotipos']} icon="⚙️" status="Arquitectura preparada" />}

            {section === 'enterprises' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Empresas</p><h2>Registro de compañías del grupo</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Agregar o editar empresa</h3>
                    <form className="form-grid" onSubmit={handleEnterpriseSubmit}>
                      <label>Nombre<input value={enterpriseForm.name} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, name: event.target.value })} required /></label>
                      <label>RFC<input value={enterpriseForm.rfc} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, rfc: event.target.value })} /></label>
                      <label>Domicilio<input value={enterpriseForm.address} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, address: event.target.value })} /></label>
                      <label>Correo<input value={enterpriseForm.email} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, email: event.target.value })} /></label>
                      <label>Teléfono<input value={enterpriseForm.phone} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, phone: event.target.value })} /></label>
                      <label>Representante<input value={enterpriseForm.representative} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, representative: event.target.value })} /></label>
                      <label>Estado<select value={enterpriseForm.status} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, status: event.target.value })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="en revisión">En revisión</option></select></label>
                      <label className="full-width">Observaciones<textarea value={enterpriseForm.observations} onChange={(event) => setEnterpriseForm({ ...enterpriseForm, observations: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{enterpriseForm.id ? 'Guardar empresa' : 'Agregar empresa'}</button>{enterpriseForm.id ? <button type="button" className="secondary-btn" onClick={() => setEnterpriseForm({ id: null, name: '', rfc: '', address: '', email: '', phone: '', representative: '', status: 'activo', observations: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Empresas registradas</h3>
                    <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Representante</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.enterprises.map((enterprise) => <tr key={enterprise.id}><td>{enterprise.name}</td><td>{enterprise.representative}</td><td>{enterprise.status}</td><td><button className="table-btn" onClick={() => handleEnterpriseEdit(enterprise)}>Editar</button><button className="table-btn danger" onClick={() => handleEnterpriseDelete(enterprise.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}

            {section === 'foundry' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Herrería</p><h2>Órdenes, producción y seguimiento</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Registrar orden de trabajo</h3>
                    <form className="form-grid" onSubmit={handleFoundrySubmit}>
                      <label>Cliente<input value={foundryForm.client} onChange={(event) => setFoundryForm({ ...foundryForm, client: event.target.value })} required /></label>
                      <label>Producto<input value={foundryForm.product} onChange={(event) => setFoundryForm({ ...foundryForm, product: event.target.value })} /></label>
                      <label>Cantidad<input type="number" value={foundryForm.quantity} onChange={(event) => setFoundryForm({ ...foundryForm, quantity: event.target.value })} /></label>
                      <label>Prioridad<select value={foundryForm.priority} onChange={(event) => setFoundryForm({ ...foundryForm, priority: event.target.value })}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></label>
                      <label>Estado<select value={foundryForm.status} onChange={(event) => setFoundryForm({ ...foundryForm, status: event.target.value })}><option value="cotizada">Cotizada</option><option value="en producción">En producción</option><option value="entregada">Entregada</option></select></label>
                      <label>Fecha de entrega<input type="date" value={foundryForm.deliveryDate} onChange={(event) => setFoundryForm({ ...foundryForm, deliveryDate: event.target.value })} /></label>
                      <label className="full-width">Observaciones<textarea value={foundryForm.observations} onChange={(event) => setFoundryForm({ ...foundryForm, observations: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{foundryForm.id ? 'Guardar orden' : 'Agregar orden'}</button>{foundryForm.id ? <button type="button" className="secondary-btn" onClick={() => setFoundryForm({ id: null, client: '', product: '', quantity: '', priority: 'media', status: 'cotizada', deliveryDate: '', observations: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Órdenes activas</h3>
                    <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Producto</th><th>Prioridad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.foundryOrders.map((order) => <tr key={order.id}><td>{order.client}</td><td>{order.product}</td><td>{order.priority}</td><td>{order.status}</td><td><button className="table-btn" onClick={() => handleFoundryEdit(order)}>Editar</button><button className="table-btn danger" onClick={() => handleFoundryDelete(order.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}

            {section === 'construction' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Construcción</p><h2>Obras, presupuestos y avances</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Registrar proyecto</h3>
                    <form className="form-grid" onSubmit={handleConstructionSubmit}>
                      <label>Nombre<input value={constructionForm.name} onChange={(event) => setConstructionForm({ ...constructionForm, name: event.target.value })} required /></label>
                      <label>Cliente<input value={constructionForm.client} onChange={(event) => setConstructionForm({ ...constructionForm, client: event.target.value })} /></label>
                      <label>Presupuesto<input type="number" value={constructionForm.budget} onChange={(event) => setConstructionForm({ ...constructionForm, budget: event.target.value })} /></label>
                      <label>Días estimados<input type="number" value={constructionForm.estimated} onChange={(event) => setConstructionForm({ ...constructionForm, estimated: event.target.value })} /></label>
                      <label>Avance (%)<input type="number" value={constructionForm.progress} onChange={(event) => setConstructionForm({ ...constructionForm, progress: event.target.value })} /></label>
                      <label>Estado<select value={constructionForm.status} onChange={(event) => setConstructionForm({ ...constructionForm, status: event.target.value })}><option value="planeación">Planeación</option><option value="en progreso">En progreso</option><option value="terminada">Terminada</option><option value="detenida">Detenida</option></select></label>
                      <label className="full-width">Observaciones<textarea value={constructionForm.observations} onChange={(event) => setConstructionForm({ ...constructionForm, observations: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{constructionForm.id ? 'Guardar proyecto' : 'Agregar proyecto'}</button>{constructionForm.id ? <button type="button" className="secondary-btn" onClick={() => setConstructionForm({ id: null, name: '', client: '', budget: '', estimated: '', progress: '', status: 'planeación', observations: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Proyectos activos</h3>
                    <div className="table-wrap"><table><thead><tr><th>Proyecto</th><th>Cliente</th><th>Avance</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.constructionProjects.map((project) => <tr key={project.id}><td>{project.name}</td><td>{project.client}</td><td>{project.progress}%</td><td>{project.status}</td><td><button className="table-btn" onClick={() => handleConstructionEdit(project)}>Editar</button><button className="table-btn danger" onClick={() => handleConstructionDelete(project.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}

            {section === 'ruizgraphics' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Ruiz Graphics</p><h2>Pedidos de diseño y producción</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Registrar pedido</h3>
                    <form className="form-grid" onSubmit={handleRuizGraphicsSubmit}>
                      <label>Cliente<input value={ruizGraphicsForm.client} onChange={(event) => setRuizGraphicsForm({ ...ruizGraphicsForm, client: event.target.value })} required /></label>
                      <label>Servicio<input value={ruizGraphicsForm.service} onChange={(event) => setRuizGraphicsForm({ ...ruizGraphicsForm, service: event.target.value })} /></label>
                      <label>Fecha de entrega<input type="date" value={ruizGraphicsForm.deliveryDate} onChange={(event) => setRuizGraphicsForm({ ...ruizGraphicsForm, deliveryDate: event.target.value })} /></label>
                      <label>Estado<select value={ruizGraphicsForm.status} onChange={(event) => setRuizGraphicsForm({ ...ruizGraphicsForm, status: event.target.value })}><option value="en revisión">En revisión</option><option value="en producción">En producción</option><option value="entregado">Entregado</option></select></label>
                      <label className="full-width">Observaciones<textarea value={ruizGraphicsForm.observations} onChange={(event) => setRuizGraphicsForm({ ...ruizGraphicsForm, observations: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{ruizGraphicsForm.id ? 'Guardar pedido' : 'Agregar pedido'}</button>{ruizGraphicsForm.id ? <button type="button" className="secondary-btn" onClick={() => setRuizGraphicsForm({ id: null, client: '', service: '', deliveryDate: '', status: 'en revisión', observations: '' })}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Pedidos activos</h3>
                    <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.ruizGraphicsOrders.map((order) => <tr key={order.id}><td>{order.client}</td><td>{order.service}</td><td>{order.status}</td><td><button className="table-btn" onClick={() => handleRuizGraphicsEdit(order)}>Editar</button><button className="table-btn danger" onClick={() => handleRuizGraphicsDelete(order.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}

            {section === 'clients' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Clientes</p><h2>Registro de clientes</h2></div></div>
                <p className="helper-text">El trabajador de oficina puede capturar datos de clientes y vincularlos a expedientes, servicios y cotizaciones.</p>
                <form className="form-grid" onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target;
                  const client = {
                    id: createId('client'),
                    name: form.name.value,
                    phone: form.phone.value,
                    email: form.email.value,
                    address: form.address.value,
                    matter: form.matter.value,
                    observations: form.observations.value
                  };
                  setData((prev) => ({ ...prev, clients: [client, ...prev.clients] }));
                  form.reset();
                }}>
                  <label>Nombre completo<input name="name" required /></label>
                  <label>Teléfono<input name="phone" required /></label>
                  <label>Correo<input name="email" type="email" required /></label>
                  <label>Domicilio<input name="address" required /></label>
                  <label>Tipo de asunto<input name="matter" /></label>
                  <label className="full-width">Observaciones<textarea name="observations" rows="3" /></label>
                  <div className="actions-row full-width"><button type="submit">Agregar cliente</button></div>
                </form>
                <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead><tbody>{data.clients.map((client) => <tr key={client.id}><td>{client.name}</td><td>{client.phone}</td><td>{client.email}</td><td><button className="table-btn" onClick={() => alert(`Cliente: ${client.name}`)}>Ver</button></td></tr>)}</tbody></table></div>
              </section>
            )}

            {section === 'cases' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Expedientes</p><h2>Control procesal</h2></div></div>
                <form className="form-grid" onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target;
                  const caseItem = {
                    id: createId('case'),
                    caseNumber: form.caseNumber.value,
                    clientId: form.clientId.value,
                    matter: form.matter.value,
                    court: form.court.value,
                    description: form.description.value,
                    stage: form.stage.value,
                    nextAction: form.nextAction.value,
                    status: form.status.value
                  };
                  setData((prev) => ({ ...prev, cases: [caseItem, ...prev.cases] }));
                  form.reset();
                }}>
                  <label>Número de expediente<input name="caseNumber" required /></label>
                  <label>Cliente<select name="clientId" required>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label>Materia<select name="matter">{matterOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <label>Juzgado<input name="court" /></label>
                  <label>Etapa<select name="stage"><option>Inicio</option><option>Interlocutoria</option><option>Juicio</option><option>Resolución</option><option>Cerrado</option></select></label>
                  <label>Estado<select name="status"><option>activo</option><option>pendiente</option><option>cerrado</option><option>urgente</option></select></label>
                  <label className="full-width">Descripción<textarea name="description" rows="3" /></label>
                  <label className="full-width">Próxima actuación<input name="nextAction" /></label>
                  <div className="actions-row full-width"><button type="submit">Agregar expediente</button></div>
                </form>
              </section>
            )}

            {section === 'agenda' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Agenda</p><h2>Audiencias y citas</h2></div></div>
                <form className="form-grid" onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target;
                  const item = { id: createId('agenda'), title: form.title.value, type: form.type.value, dateTime: form.dateTime.value, status: form.status.value, relatedClientId: form.relatedClientId.value, description: form.description.value };
                  setData((prev) => ({ ...prev, agenda: [item, ...prev.agenda] }));
                  form.reset();
                }}>
                  <label>Título<input name="title" required /></label>
                  <label>Tipo<select name="type"><option>Audiencia</option><option>Cita</option><option>Plazo legal</option><option>Recordatorio</option></select></label>
                  <label>Fecha y hora<input type="datetime-local" name="dateTime" required /></label>
                  <label>Estado<select name="status"><option>pendiente</option><option>realizado</option><option>vencido</option></select></label>
                  <label>Cliente<select name="relatedClientId">{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label className="full-width">Descripción<textarea name="description" rows="3" /></label>
                  <div className="actions-row full-width"><button type="submit">Agregar actividad</button></div>
                </form>
              </section>
            )}

            {section === 'payments' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Pagos</p><h2>Control de pagos</h2></div></div>
                <form className="form-grid" onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target;
                  const payment = { id: createId('payment'), clientId: form.clientId.value, concept: form.concept.value, amount: Number(form.amount.value), advance: Number(form.advance.value), partialPayments: Number(form.partialPayments.value), dueDate: form.dueDate.value, status: form.status.value };
                  setData((prev) => ({ ...prev, payments: [payment, ...prev.payments] }));
                  form.reset();
                }}>
                  <label>Cliente<select name="clientId">{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label>Concepto<input name="concept" /></label>
                  <label>Honorarios pactados<input type="number" name="amount" /></label>
                  <label>Anticipo<input type="number" name="advance" /></label>
                  <label>Pagos parciales<input type="number" name="partialPayments" /></label>
                  <label>Fecha límite<input type="date" name="dueDate" /></label>
                  <label>Estado<select name="status"><option>pagado</option><option>pendiente</option><option>vencido</option></select></label>
                  <div className="actions-row full-width"><button type="submit">Agregar pago</button></div>
                </form>
              </section>
            )}

            {section === 'documents' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Documentos</p><h2>Archivo documental</h2></div></div>
                <form className="form-grid" onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target;
                  const doc = { id: createId('document'), title: form.title.value, type: form.type.value, date: form.date.value, clientId: form.clientId.value, caseId: form.caseId.value, observations: form.observations.value };
                  setData((prev) => ({ ...prev, documents: [doc, ...prev.documents] }));
                  form.reset();
                }}>
                  <label>Título<input name="title" required /></label>
                  <label>Tipo<select name="type"><option>contrato</option><option>demanda</option><option>escrito</option><option>prueba</option><option>recibo</option><option>convenio</option><option>identificación</option></select></label>
                  <label>Fecha<input type="date" name="date" /></label>
                  <label>Cliente<select name="clientId">{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label>Expediente<select name="caseId">{data.cases.map((item) => <option key={item.id} value={item.id}>{item.caseNumber}</option>)}</select></label>
                  <label className="full-width">Observaciones<textarea name="observations" rows="3" /></label>
                  <div className="actions-row full-width"><button type="submit">Agregar documento</button></div>
                </form>
              </section>
            )}

            {section === 'matters' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Catálogo</p><h2>Materias jurídicas editables</h2></div></div>
                {canManageCatalog ? (
                  <>
                    <form className="form-grid" onSubmit={handleMatterSubmit}>
                      <label>Nombre de la materia<input value={matterForm.name} onChange={(event) => setMatterForm({ ...matterForm, name: event.target.value })} required /></label>
                      <div className="actions-row"><button type="submit">{matterEditingId ? 'Guardar' : 'Agregar materia'}</button>{matterEditingId ? <button type="button" className="secondary-btn" onClick={() => { setMatterEditingId(null); setMatterForm({ id: null, name: '' }); }}>Cancelar</button> : null}</div>
                    </form>
                    <div className="table-wrap"><table><thead><tr><th>Materia</th><th>Acciones</th></tr></thead><tbody>{data.matters.map((matter) => <tr key={matter}><td>{matter}</td><td><button className="table-btn" onClick={() => handleMatterEdit(matter)}>Editar</button><button className="table-btn danger" onClick={() => handleMatterDelete(matter)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </>
                ) : <p className="helper-text">Este rol solo puede consultar el catálogo.</p>}
              </section>
            )}

            {section === 'services' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Servicios jurídicos</p><h2>Catálogo de servicios</h2></div></div>
                {canManageCatalog ? (
                  <div className="service-grid">
                    <div className="panel">
                      <h3>Registrar servicio</h3>
                      <form className="form-grid" onSubmit={handleServiceSubmit}>
                        <label>Nombre del servicio<input value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} required /></label>
                        <label>Materia<select value={serviceForm.matter} onChange={(event) => setServiceForm({ ...serviceForm, matter: event.target.value })}>{data.matters.map((matter) => <option key={matter} value={matter}>{matter}</option>)}</select></label>
                        <label>Precio base<input type="number" value={serviceForm.basePrice} onChange={(event) => setServiceForm({ ...serviceForm, basePrice: event.target.value })} required /></label>
                        <label>Anticipo sugerido<input type="number" value={serviceForm.suggestedAdvance} onChange={(event) => setServiceForm({ ...serviceForm, suggestedAdvance: event.target.value })} /></label>
                        <label>Forma de cobro<select value={serviceForm.paymentForm} onChange={(event) => setServiceForm({ ...serviceForm, paymentForm: event.target.value })}>{paymentForms.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                        <label>Tiempo estimado<input value={serviceForm.estimatedTime} onChange={(event) => setServiceForm({ ...serviceForm, estimatedTime: event.target.value })} /></label>
                        <label>Estado<select value={serviceForm.status} onChange={(event) => setServiceForm({ ...serviceForm, status: event.target.value })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
                        <label className="full-width">Descripción<textarea value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} rows="2" /></label>
                        <label className="full-width">Documentos requeridos<input value={serviceForm.requiredDocuments} onChange={(event) => setServiceForm({ ...serviceForm, requiredDocuments: event.target.value })} /></label>
                        <label className="full-width">Observaciones<textarea value={serviceForm.observations} onChange={(event) => setServiceForm({ ...serviceForm, observations: event.target.value })} rows="2" /></label>
                        <div className="actions-row full-width"><button type="submit">{serviceEditingId ? 'Guardar' : 'Agregar servicio'}</button>{serviceEditingId ? <button type="button" className="secondary-btn" onClick={() => { setServiceEditingId(null); setServiceForm({ id: null, name: '', matter: '', description: '', basePrice: '', suggestedAdvance: '', paymentForm: 'fijo', estimatedTime: '', requiredDocuments: '', observations: '', status: 'activo' }); }}>Cancelar</button> : null}</div>
                      </form>
                    </div>
                    <div className="panel">
                      <h3>Servicios disponibles</h3>
                      <div className="table-wrap"><table><thead><tr><th>Servicio</th><th>Materia</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.services.map((service) => <tr key={service.id}><td>{service.name}</td><td>{service.matter}</td><td>{formatCurrency(service.basePrice)}</td><td>{service.status}</td><td><button className="table-btn" onClick={() => handleServiceEdit(service)}>Editar</button><button className="table-btn danger" onClick={() => handleServiceDelete(service.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                    </div>
                  </div>
                ) : <p className="helper-text">El rol actual solo puede consultar y usar el catálogo.</p>}
              </section>
            )}

            {section === 'quotations' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Cotizaciones y cobros</p><h2>Crear y controlar cotizaciones</h2></div></div>
                <div className="service-grid">
                  <div className="panel">
                    <h3>Nueva cotización</h3>
                    <form className="form-grid" onSubmit={handleQuoteSubmit}>
                      <label>Cliente<select value={quoteForm.clientId} onChange={(event) => setQuoteForm({ ...quoteForm, clientId: event.target.value })} required>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                      <label>Servicio<select value={quoteForm.serviceId} onChange={(event) => setQuoteForm({ ...quoteForm, serviceId: event.target.value })} required>{data.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
                      <label>Materia<select value={quoteForm.matter} onChange={(event) => setQuoteForm({ ...quoteForm, matter: event.target.value })}>{data.matters.map((matter) => <option key={matter} value={matter}>{matter}</option>)}</select></label>
                      <label>Precio total<input type="number" value={quoteForm.totalPrice} onChange={(event) => setQuoteForm({ ...quoteForm, totalPrice: event.target.value })} required /></label>
                      <label>Anticipo<input type="number" value={quoteForm.advance} onChange={(event) => setQuoteForm({ ...quoteForm, advance: event.target.value })} /></label>
                      <label>Gastos adicionales<input type="number" value={quoteForm.additionalExpenses} onChange={(event) => setQuoteForm({ ...quoteForm, additionalExpenses: event.target.value })} /></label>
                      <label>Descuento<input type="number" value={quoteForm.discount} onChange={(event) => setQuoteForm({ ...quoteForm, discount: event.target.value })} /></label>
                      <label>Fecha cotización<input type="date" value={quoteForm.quoteDate} onChange={(event) => setQuoteForm({ ...quoteForm, quoteDate: event.target.value })} /></label>
                      <label>Fecha límite<input type="date" value={quoteForm.paymentDeadline} onChange={(event) => setQuoteForm({ ...quoteForm, paymentDeadline: event.target.value })} /></label>
                      <label>Estado<select value={quoteForm.status} onChange={(event) => setQuoteForm({ ...quoteForm, status: event.target.value })}>{quoteStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                      <label className="full-width">Descripción<textarea value={quoteForm.description} onChange={(event) => setQuoteForm({ ...quoteForm, description: event.target.value })} rows="2" /></label>
                      <div className="actions-row full-width"><button type="submit">{quoteEditingId ? 'Guardar' : 'Crear cotización'}</button>{quoteEditingId ? <button type="button" className="secondary-btn" onClick={() => { setQuoteEditingId(null); setQuoteForm({ id: null, clientId: '', serviceId: '', matter: '', totalPrice: '', advance: '', pendingBalance: '', additionalExpenses: '', discount: '', finalTotal: '', quoteDate: new Date().toISOString().slice(0, 10), paymentDeadline: '', status: 'pendiente', description: '' }); }}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Resumen y cálculo</h3>
                    <div className="summary-box">
                      <p><strong>Total</strong><span>{formatCurrency(Number(quoteForm.totalPrice || 0) + Number(quoteForm.additionalExpenses || 0) - Number(quoteForm.discount || 0))}</span></p>
                      <p><strong>Anticipo</strong><span>{formatCurrency(Number(quoteForm.advance || 0))}</span></p>
                      <p><strong>Saldo pendiente</strong><span>{formatCurrency(Math.max(Number(quoteForm.totalPrice || 0) + Number(quoteForm.additionalExpenses || 0) - Number(quoteForm.discount || 0) - Number(quoteForm.advance || 0), 0))}</span></p>
                      <p><strong>Ganancia estimada</strong><span>{formatCurrency(Math.max(Number(quoteForm.totalPrice || 0) + Number(quoteForm.additionalExpenses || 0) - Number(quoteForm.discount || 0) - Number(quoteForm.advance || 0), 0))}</span></p>
                      <p><strong>Gastos</strong><span>{formatCurrency(Number(quoteForm.additionalExpenses || 0))}</span></p>
                      <p><strong>Adeudo del cliente</strong><span>{formatCurrency(Math.max(Number(quoteForm.totalPrice || 0) + Number(quoteForm.additionalExpenses || 0) - Number(quoteForm.discount || 0) - Number(quoteForm.advance || 0), 0))}</span></p>
                    </div>
                  </div>
                </div>
                <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Total</th><th>Saldo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.quotations.map((quote) => <tr key={quote.id}><td>{data.clients.find((client) => client.id === quote.clientId)?.name || '—'}</td><td>{data.services.find((service) => service.id === quote.serviceId)?.name || '—'}</td><td>{formatCurrency(quote.finalTotal)}</td><td>{formatCurrency(quote.pendingBalance)}</td><td>{quote.status}</td><td><button className="table-btn" onClick={() => handleQuoteEdit(quote)}>Editar</button><button className="table-btn danger" onClick={() => handleQuoteDelete(quote.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
              </section>
            )}

            {section === 'invoices' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Facturas y recibos</p><h2>Comprobantes internos</h2></div></div>
                <div className="search-row">
                  <input placeholder="Buscar por cliente" value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} />
                  <input placeholder="Buscar por folio" value={invoiceFolioSearch} onChange={(event) => setInvoiceFolioSearch(event.target.value)} />
                </div>
                <form className="form-grid" onSubmit={handleInvoiceSubmit}>
                  <label>Fecha<input type="date" value={invoiceForm.date} onChange={(event) => setInvoiceForm({ ...invoiceForm, date: event.target.value })} /></label>
                  <label>Cliente<select value={invoiceForm.clientId} onChange={(event) => setInvoiceForm({ ...invoiceForm, clientId: event.target.value })}>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label>Servicio<select value={invoiceForm.serviceId} onChange={(event) => setInvoiceForm({ ...invoiceForm, serviceId: event.target.value })}>{data.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
                  <label>Concepto<input value={invoiceForm.concept} onChange={(event) => setInvoiceForm({ ...invoiceForm, concept: event.target.value })} /></label>
                  <label>Subtotal<input type="number" value={invoiceForm.subtotal} onChange={(event) => setInvoiceForm({ ...invoiceForm, subtotal: event.target.value })} /></label>
                  <label>Descuento<input type="number" value={invoiceForm.discount} onChange={(event) => setInvoiceForm({ ...invoiceForm, discount: event.target.value })} /></label>
                  <label>Gastos<input type="number" value={invoiceForm.expenses} onChange={(event) => setInvoiceForm({ ...invoiceForm, expenses: event.target.value })} /></label>
                  <label>Anticipo<input type="number" value={invoiceForm.advance} onChange={(event) => setInvoiceForm({ ...invoiceForm, advance: event.target.value })} /></label>
                  <label>Método de pago<select value={invoiceForm.paymentMethod} onChange={(event) => setInvoiceForm({ ...invoiceForm, paymentMethod: event.target.value })}>{invoiceMethods.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <label>Estado<select value={invoiceForm.status} onChange={(event) => setInvoiceForm({ ...invoiceForm, status: event.target.value })}>{invoiceStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <div className="actions-row full-width"><button type="submit">{invoiceEditingId ? 'Guardar' : 'Crear comprobante'}</button>{invoiceEditingId ? <button type="button" className="secondary-btn" onClick={() => { setInvoiceEditingId(null); setInvoiceForm({ id: null, clientId: '', serviceId: '', concept: '', subtotal: '', discount: '', expenses: '', total: '', advance: '', balance: '', paymentMethod: 'efectivo', status: 'pendiente', date: new Date().toISOString().slice(0, 10) }); }}>Cancelar</button> : null}</div>
                </form>
                <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Cliente</th><th>Concepto</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr key={invoice.id}><td>{invoice.folio}</td><td>{data.clients.find((client) => client.id === invoice.clientId)?.name || '—'}</td><td>{invoice.concept}</td><td>{formatCurrency(invoice.total)}</td><td>{invoice.status}</td><td><button className="table-btn" onClick={() => handleInvoiceEdit(invoice)}>Editar</button><button className="table-btn" onClick={() => handlePrintInvoice(invoice)}>Imprimir</button><button className="table-btn" onClick={() => handleDownloadInvoice(invoice)}>Descargar</button><button className="table-btn danger" onClick={() => handleInvoiceDelete(invoice.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
              </section>
            )}

            {section === 'templates' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Contratos y machotes</p><h2>Plantillas y documentos</h2></div></div>
                <input placeholder="Buscar por materia o nombre" value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} />
                <div className="service-grid">
                  <div className="panel">
                    <h3>Crear o editar machote</h3>
                    <form className="form-grid" onSubmit={handleTemplateSubmit}>
                      <label>Nombre del documento<input value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} required /></label>
                      <label>Materia<input value={templateForm.matter} onChange={(event) => setTemplateForm({ ...templateForm, matter: event.target.value })} /></label>
                      <label className="full-width">Descripción<textarea value={templateForm.description} onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })} rows="2" /></label>
                      <label className="full-width">Texto editable<textarea value={templateForm.content} onChange={(event) => setTemplateForm({ ...templateForm, content: event.target.value })} rows="8" /></label>
                      <div className="actions-row full-width"><button type="submit">{templateEditingId ? 'Guardar' : 'Crear machote'}</button>{templateEditingId ? <button type="button" className="secondary-btn" onClick={() => { setTemplateEditingId(null); setTemplateForm({ id: null, name: '', matter: '', description: '', content: '' }); }}>Cancelar</button> : null}</div>
                    </form>
                  </div>
                  <div className="panel">
                    <h3>Machotes guardados</h3>
                    <div className="table-wrap"><table><thead><tr><th>Documento</th><th>Materia</th><th>Acciones</th></tr></thead><tbody>{filteredTemplates.map((template) => <tr key={template.id}><td>{template.name}</td><td>{template.matter}</td><td><button className="table-btn" onClick={() => handleTemplateEdit(template)}>Editar</button><button className="table-btn" onClick={() => handleDuplicateTemplate(template)}>Duplicar</button><button className="table-btn danger" onClick={() => handleTemplateDelete(template.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                  </div>
                </div>
              </section>
            )}

            {section === 'generator' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Generador de documentos</p><h2>Preparar documento para edición e impresión</h2></div></div>
                <form className="form-grid" onSubmit={handleGenerateDocument}>
                  <label>Cliente<select value={documentGenerator.clientId} onChange={(event) => setDocumentGenerator({ ...documentGenerator, clientId: event.target.value })}>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  <label>Expediente<select value={documentGenerator.caseId} onChange={(event) => setDocumentGenerator({ ...documentGenerator, caseId: event.target.value })}>{data.cases.map((item) => <option key={item.id} value={item.id}>{item.caseNumber}</option>)}</select></label>
                  <label>Servicio<select value={documentGenerator.serviceId} onChange={(event) => setDocumentGenerator({ ...documentGenerator, serviceId: event.target.value })}>{data.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
                  <label>Machote<select value={documentGenerator.templateId} onChange={(event) => setDocumentGenerator({ ...documentGenerator, templateId: event.target.value })}>{data.templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
                  <div className="actions-row full-width"><button type="submit">Generar documento</button><button type="button" className="secondary-btn" onClick={handleSaveGeneratedDocument}>Guardar</button><button type="button" className="secondary-btn" onClick={handlePrintDocument}>Imprimir</button><button type="button" className="secondary-btn" onClick={handleDownloadDocument}>Descargar</button></div>
                </form>
                <textarea value={generatedText} onChange={(event) => setGeneratedText(event.target.value)} rows="16" />
              </section>
            )}

            {section === 'profile' && (
              <section className="section-card">
                <div className="section-head"><div><p className="brand-label">Perfil del despacho</p><h2>Configuración institucional</h2></div></div>
                <form className="form-grid" onSubmit={handleProfileSubmit}>
                  <label>Nombre del despacho<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} /></label>
                  <label>Nombre del titular<input value={profileForm.attorney} onChange={(event) => setProfileForm({ ...profileForm, attorney: event.target.value })} /></label>
                  <label>Cédula profesional<input value={profileForm.professionalLicense} onChange={(event) => setProfileForm({ ...profileForm, professionalLicense: event.target.value })} /></label>
                  <label>RFC<input value={profileForm.rfc} onChange={(event) => setProfileForm({ ...profileForm, rfc: event.target.value })} /></label>
                  <label>Domicilio<input value={profileForm.address} onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })} /></label>
                  <label>Teléfono<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label>
                  <label>Correo<input value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} /></label>
                  <label>Sitio web<input value={profileForm.website} onChange={(event) => setProfileForm({ ...profileForm, website: event.target.value })} /></label>
                  <label>Frase del despacho<input value={profileForm.slogan} onChange={(event) => setProfileForm({ ...profileForm, slogan: event.target.value })} /></label>
                  <label className="full-width">Logo (opcional)<input value={profileForm.logo} onChange={(event) => setProfileForm({ ...profileForm, logo: event.target.value })} /></label>
                  <div className="actions-row full-width"><button type="submit">Guardar perfil</button></div>
                </form>
              </section>
            )}

            <section className="section-card">
              <div className="section-head"><div><p className="brand-label">Respaldo y migración</p><h2>Exportar, importar y preparar datos</h2></div></div>
              <div className="service-grid">
                <div className="panel">
                  <h3>Respaldo completo</h3>
                  <label>Nombre del archivo<input value={backupFileName} onChange={(event) => setBackupFileName(event.target.value)} placeholder="proyecto-zamorano-backup.json" /></label>
                  <div className="actions-row"><button type="button" onClick={handleExportBackup}>Exportar respaldo</button><label className="secondary-btn file-label"><span>Importar respaldo</span><input type="file" accept="application/json" onChange={handleImportBackup} /></label></div>
                  <p className="helper-text"><strong>Último respaldo:</strong> {lastBackupAt ? formatDate(lastBackupAt) : 'Aún no se ha generado un respaldo.'}</p>
                  {backupWarning.isWarning ? <p className="warning-text">Advertencia: han transcurrido {backupWarning.daysWithoutBackup ?? 'varios'} días desde el último respaldo. Se recomienda generar uno nuevo.</p> : <p className="helper-text">Los respaldos están al día.</p>}
                  {backupStatus ? <p className="helper-text">{backupStatus}</p> : null}
                  <p className="helper-text">Uso: exporta un archivo JSON de forma periódica y guárdalo en una carpeta segura. Cuando necesites restaurar, importa el archivo desde aquí.</p>
                </div>
                <div className="panel">
                  <h3>Preparación para PostgreSQL o Supabase</h3>
                  <p className="helper-text">El formato del respaldo está preparado para migrar fácilmente a una base de datos relacional sin cambiar la lógica principal de la aplicación. Las entidades actuales pueden mapearse a tablas o a JSONB.</p>
                  <div className="actions-row"><button type="button" className="secondary-btn" onClick={handlePrepareDbMigration}>Descargar plan de migración</button></div>
                </div>
              </div>
            </section>

            <section className="section-card">
              <div className="section-head"><div><p className="brand-label">Reporte de cobro imprimible</p><h2>Generar recibo o reporte</h2></div></div>
              <div className="service-grid">
                <div className="panel">
                  <label>Seleccione una cotización<select value={reportQuoteId} onChange={(event) => setReportQuoteId(event.target.value)}>{data.quotations.map((quote) => <option key={quote.id} value={quote.id}>{data.clients.find((client) => client.id === quote.clientId)?.name || '—'}</option>)}</select></label>
                  <div className="actions-row"><button type="button" onClick={() => { const printWindow = window.open('', '_blank', 'width=900,height=1000'); printWindow.document.write(`<pre>${reportDraft}</pre>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); }}>Imprimir</button><button type="button" className="secondary-btn" onClick={() => { const blob = new Blob([reportDraft], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'reporte-cobro.txt'; link.click(); URL.revokeObjectURL(link.href); }}>Guardar</button><button type="button" className="secondary-btn" onClick={() => { const blob = new Blob([`<pre>${reportDraft}</pre>`], { type: 'text/html;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'reporte-cobro.html'; link.click(); URL.revokeObjectURL(link.href); }}>Descargar PDF</button></div>
                </div>
                <div className="panel">
                  <textarea value={reportDraft} onChange={(event) => setReportDraft(event.target.value)} rows="16" />
                </div>
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
