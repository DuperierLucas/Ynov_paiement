if (process.env.NODE_ENV != 'production') {
	require('dotenv').config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const express = require('express');

const app = express();

const fs = require('fs');
const stripe = require('stripe')(stripeSecretKey);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

app.get('/ice', function (req, res) {
	fs.readFile('items.json', function (error, data) {
		if (error) {
			res.status(500).end();
		} else {
			res.render('ice.ejs', {
				stripePublicKey: stripePublicKey,
				items: JSON.parse(data),
			});
		}
	});
});

app.post('/create-checkout-session', async (req, res) => {
	const session = await stripe.checkout.sessions.create({
		line_items: req.body.itemsArray,
		mode: 'payment',
		payment_method_types: ['card', 'bancontact', 'alipay', 'eps', 'giropay', 'ideal', 'klarna', 'p24', 'sepa_debit', 'sofort'],
		success_url: "http://localhost:4242/order/success?session_id={CHECKOUT_SESSION_ID}",
		cancel_url: "http://localhost:4242/order/canceled?session_id={CHECKOUT_SESSION_ID}",
	});

	res.json({ url: session.url });
});

app.get('/order/success', async (req, res) => {
	const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
	const customer = await stripe.customers.retrieve(session.customer);
  
	res.send(`<html><body><h1>Merci pour votre commande, ${customer.name}!</h1></body></html>`);
});

app.get('/order/canceled', async (req, res) => {
	const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
	res.send(`<html><body><h1>Veuillez nous excuser, votre paiement a été rejeté ou annulé.</h1></body></html>`);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
