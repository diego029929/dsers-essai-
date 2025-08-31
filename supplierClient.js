const { nanoid } = require('nanoid');

async function placeOrderWithSupplier(order) {
  return {
    ok: true,
    supplierOrderId: 'MOCK-' + nanoid(6),
    trackingNumber: 'TRK-' + Math.floor(Math.random() * 1000000),
    estimatedDeliveryDays: 10
  };
}

module.exports = { placeOrderWithSupplier };
