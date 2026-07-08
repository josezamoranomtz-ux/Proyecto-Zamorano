import { useEffect, useMemo, useState } from 'react';

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
  { id: 'dashboard', label: 'Panel principal' },
  { id: 'clients', label: 'Clientes' },
  { id: 'cases', label: 'Expedientes' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'payments', label: 'Pagos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'matters', label: 'Materias' },
  { id: 'services', label: 'Servicios' },
  { id: 'quotations', label: 'Cotizaciones' },
  { id: 'invoices', label: 'Facturas y recibos' },
  { id: 'templates', label: 'Contratos y machotes' },
  { id: 'generator', label: 'Generador de documentos' },
  { id: 'profile', label: 'Perfil del despacho' }
];

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
  const [templateSearch, setTemplateSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFolioSearch, setInvoiceFolioSearch] = useState('');
  const [documentGenerator, setDocumentGenerator] = useState({ clientId: '', caseId: '', serviceId: '', templateId: '' });
  const [generatedText, setGeneratedText] = useState('');
  const [reportQuoteId, setReportQuoteId] = useState(data.quotations[0]?.id || '');
  const [reportDraft, setReportDraft] = useState('');

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

  const visibleMenu = useMemo(() => {
    const base = menuItems.filter((item) => {
      if (role === 'admin') return true;
      if (role === 'trabajador') return ['dashboard', 'clients', 'cases', 'agenda', 'payments', 'documents', 'services', 'quotations', 'invoices', 'templates', 'generator'].includes(item.id);
      if (role === 'capturista') return ['dashboard', 'clients', 'cases', 'services', 'quotations', 'invoices', 'generator'].includes(item.id);
      if (role === 'abogado') return ['dashboard', 'cases', 'quotations', 'invoices', 'templates', 'generator', 'profile'].includes(item.id);
      return false;
    });
    return base;
  }, [role]);

  const dashboardStats = useMemo(() => {
    const pendingQuotes = data.quotations.filter((item) => item.status === 'pendiente' || item.status === 'aprobado').length;
    const pendingInvoices = data.invoices.filter((item) => item.status === 'pendiente' || item.status === 'parcial').length;
    const activeServices = data.services.filter((item) => item.status === 'activo').length;
    return {
      clients: data.clients.length,
      cases: data.cases.length,
      pendingQuotes,
      pendingInvoices,
      activeServices
    };
  }, [data]);

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

  const canManageCatalog = role === 'admin' || role === 'abogado';
  const canCreateOfficeDocs = role === 'admin' || role === 'trabajador' || role === 'capturista' || role === 'abogado';

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
            <p className="login-copy">Ingrese con su cuenta para operar el despacho jurídico desde una sola plataforma.</p>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <label>Usuario<input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} placeholder="admin" /></label>
              <label>Contraseña<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="123456" /></label>
              {authError ? <p className="error-text">{authError}</p> : null}
              <button type="submit">Ingresar</button>
            </form>
            <p className="hint-text">Accesos demo: admin, oficina, capturista, abogado · contraseña: 123456</p>
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
                    <p className="brand-label">Panel principal</p>
                    <h2>Resumen operativo del despacho</h2>
                  </div>
                </div>
                <div className="stats-grid">
                  <article className="stat-card"><span>Clientes</span><strong>{dashboardStats.clients}</strong></article>
                  <article className="stat-card"><span>Expedientes</span><strong>{dashboardStats.cases}</strong></article>
                  <article className="stat-card"><span>Cotizaciones pendientes</span><strong>{dashboardStats.pendingQuotes}</strong></article>
                  <article className="stat-card"><span>Recibos pendientes</span><strong>{dashboardStats.pendingInvoices}</strong></article>
                  <article className="stat-card"><span>Servicios activos</span><strong>{dashboardStats.activeServices}</strong></article>
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
