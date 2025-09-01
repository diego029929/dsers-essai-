const { Low, JSONFile } = require('lowdb');
const path = require('path');

const file = path.join('/tmp', 'db.json'); // Stockage dans /tmp pour éviter problème de permissions
console.log('ℹ️ db.js chargé, fichier DB:', file);

const adapter = new JSONFile(file);
const db = new Low(adapter);

async function init() {
  try {
    console.log('🔄 Initialisation de la DB...');
    await db.read();
    db.data = db.data || { orders: [] };
    await db.write();
    console.log('✅ DB initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation DB:', error);
  }
}

async function addOrder(order) {
  try {
    console.log('➕ Ajout d\'une commande:', order);
    await db.read();
    db.data.orders.push(order);
    await db.write();
    console.log('✅ Commande ajoutée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la commande:', error);
  }
}

async function updateOrder(id, patch) {
  try {
    await db.read();
    const order = db.data.orders.find(o => o.id === id);
    if (!order) {
      console.log(`⚠️ Commande non trouvée pour l'id ${id}`);
      return null;
    }
    Object.assign(order, patch);
    await db.write();
    console.log(`✅ Commande ${id} mise à jour`);
    return order;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de la commande ${id}:`, error);
    return null;
  }
}

async function getOrder(id) {
  try {
    await db.read();
    const order = db.data.orders.find(o => o.id === id) || null;
    console.log(`🔍 Récupération de la commande ${id}:`, order);
    return order;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de la commande ${id}:`, error);
    return null;
  }
}

async function listOrders() {
  try {
    await db.read();
    console.log(`📋 Liste des commandes récupérée (${db.data.orders.length} commandes)`);
    return db.data.orders;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    return [];
  }
}

module.exports = { init, addOrder, updateOrder, getOrder, listOrders };
                  
