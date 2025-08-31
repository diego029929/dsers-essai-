const { Low, JSONFile } = require('lowdb');
const path = require('path');

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function init() {
  await db.read();
  db.data = db.data || { orders: [] };
  await db.write();
}

async function addOrder(order) {
  await db.read();
  db.data.orders.push(order);
  await db.write();
}

async function updateOrder(id, patch) {
  await db.read();
  const order = db.data.orders.find(o => o.id === id);
  if (!order) return null;
  Object.assign(order, patch);
  await db.write();
  return order;
}

async function getOrder(id) {
  await db.read();
  return db.data.orders.find(o => o.id === id) || null;
}

async function listOrders() {
  await db.read();
  return db.data.orders;
}

module.exports = { init, addOrder, updateOrder, getOrder, listOrders };
