require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nanoid } = require('nanoid');
const db = require('./db');
const supplier = require('./supplierClient');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(bodyParser.json());

// Démarrage de l'application
async function start() {
  await db.init();

  // Créer une session de paiement Stripe
  app.post('/create-checkout-session', async (req, res) => {
    const { items, customer } = req.body;
    if (!items || !customer) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.productId },
            unit_amount: 100 * item.quantity // Prix simulé
          },
          quantity: 1
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel.html`
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Webhook Stripe
  app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Erreur de webhook :', err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const order = {
        id: 'ORD-' + nanoid(8),
        createdAt: new Date().toISOString(),
        customer: {
          name: session.customer_details.name,
          address: session.customer_details.address?.line1 || ''
        },
        items: session.display_items || [],
        status: 'placed',
        supplierInfo: await supplier.placeOrderWithSupplier(session.display_items || [])
      };

      await db.addOrder(order);
    }

    res.status(200).json({ received: true });
  });

  // Lancer le serveur
  app.listen(PORT, () => {
    console.log(`✅ Mini-DSers API en ligne : http://localhost:${PORT}`);
  });
}

start(); // <--- cette ligne était déjà correcte
