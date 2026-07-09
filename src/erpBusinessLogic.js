export function applyPurchaseTransaction({ purchase, inventoryItems, suppliers, accountingEntries }) {
  const item = inventoryItems.find((entry) => entry.id === purchase.itemId);
  const supplier = suppliers.find((entry) => entry.id === purchase.supplierId);
  const updatedItems = inventoryItems.map((entry) => {
    if (entry.id !== purchase.itemId) return entry;
    const quantity = Number(purchase.quantity || 0);
    const unitCost = Number(purchase.unitCost || entry.cost || 0);
    const nextStock = Number(entry.stock || 0) + quantity;
    const nextCost = unitCost;
    return { ...entry, stock: nextStock, cost: nextCost };
  });

  const updatedSuppliers = suppliers.map((entry) => {
    if (entry.id !== purchase.supplierId) return entry;
    const total = Number(purchase.total || 0);
    return { ...entry, balance: Number(entry.balance || 0) + total };
  });

  const updatedEntries = [
    ...accountingEntries,
    {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'payable',
      amount: Number(purchase.total || 0),
      date: purchase.date,
      entityId: purchase.supplierId,
      description: `Compra ${purchase.id}`,
      relatedModule: 'purchases'
    }
  ];

  return {
    inventoryItems: updatedItems,
    suppliers: updatedSuppliers,
    accountingEntries: updatedEntries,
    purchaseSummary: {
      itemName: item?.name || 'Producto',
      supplierName: supplier?.name || 'Proveedor',
      quantity: Number(purchase.quantity || 0),
      amount: Number(purchase.total || 0)
    }
  };
}

export function applySalesTransaction({ sale, inventoryItems, clients, accountingEntries }) {
  const item = inventoryItems.find((entry) => entry.id === sale.itemId);
  const client = clients.find((entry) => entry.id === sale.clientId);
  const updatedItems = inventoryItems.map((entry) => {
    if (entry.id !== sale.itemId) return entry;
    const quantity = Number(sale.quantity || 0);
    const nextStock = Number(entry.stock || 0) - quantity;
    return { ...entry, stock: Math.max(nextStock, 0) };
  });

  const updatedClients = clients.map((entry) => {
    if (entry.id !== sale.clientId) return entry;
    const total = Number(sale.total || 0);
    return { ...entry, balance: Number(entry.balance || 0) + total };
  });

  const updatedEntries = [
    ...accountingEntries,
    {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'receivable',
      amount: Number(sale.total || 0),
      date: sale.date,
      entityId: sale.clientId,
      description: `Venta ${sale.id}`,
      relatedModule: 'sales'
    },
    {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'income',
      amount: Number(sale.total || 0),
      date: sale.date,
      entityId: sale.clientId,
      description: `Ingreso ${sale.id}`,
      relatedModule: 'sales'
    }
  ];

  return {
    inventoryItems: updatedItems,
    clients: updatedClients,
    accountingEntries: updatedEntries,
    saleSummary: {
      itemName: item?.name || 'Producto',
      clientName: client?.name || 'Cliente',
      quantity: Number(sale.quantity || 0),
      amount: Number(sale.total || 0)
    }
  };
}

export function getAccountingSummary({ accountingEntries }) {
  const summary = accountingEntries.reduce(
    (acc, entry) => {
      if (entry.type === 'income') acc.income += Number(entry.amount || 0);
      if (entry.type === 'payable') acc.payable += Number(entry.amount || 0);
      if (entry.type === 'receivable') acc.receivable += Number(entry.amount || 0);
      return acc;
    },
    { income: 0, payable: 0, receivable: 0, balance: 0 }
  );

  summary.balance = summary.income - summary.payable;
  return summary;
}
