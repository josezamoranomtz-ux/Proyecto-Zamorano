import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPurchaseTransaction, applySalesTransaction, getAccountingSummary } from './erpBusinessLogic.js';

test('applyPurchaseTransaction increases stock and creates a payable entry', () => {
  const result = applyPurchaseTransaction({
    purchase: { id: 'p1', supplierId: 'sup-1', date: '2026-07-08', total: 1200, itemId: 'itm-1', quantity: 5, unitCost: 240 },
    inventoryItems: [{ id: 'itm-1', name: 'Acero', stock: 10, cost: 200 }],
    suppliers: [{ id: 'sup-1', name: 'Metal S.A.', balance: 0 }],
    accountingEntries: []
  });

  assert.equal(result.inventoryItems[0].stock, 15);
  assert.equal(result.inventoryItems[0].cost, 240);
  assert.equal(result.suppliers[0].balance, 1200);
  assert.equal(result.accountingEntries[0].type, 'payable');
  assert.equal(result.accountingEntries[0].amount, 1200);
});

test('applySalesTransaction decreases stock and creates receivable and income entries', () => {
  const result = applySalesTransaction({
    sale: { id: 's1', clientId: 'cl-1', date: '2026-07-08', total: 1500, itemId: 'itm-1', quantity: 3, unitPrice: 500 },
    inventoryItems: [{ id: 'itm-1', name: 'Acero', stock: 20, cost: 240 }],
    clients: [{ id: 'cl-1', name: 'Construcc', balance: 0 }],
    accountingEntries: []
  });

  assert.equal(result.inventoryItems[0].stock, 17);
  assert.equal(result.clients[0].balance, 1500);
  assert.equal(result.accountingEntries.filter((entry) => entry.type === 'receivable').length, 1);
  assert.equal(result.accountingEntries.filter((entry) => entry.type === 'income').length, 1);
});

test('getAccountingSummary totals entries by category', () => {
  const summary = getAccountingSummary({
    accountingEntries: [
      { type: 'income', amount: 1000 },
      { type: 'income', amount: 500 },
      { type: 'payable', amount: 300 },
      { type: 'receivable', amount: 400 }
    ]
  });

  assert.equal(summary.income, 1500);
  assert.equal(summary.payable, 300);
  assert.equal(summary.receivable, 400);
  assert.equal(summary.balance, 1200);
});
