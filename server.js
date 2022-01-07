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
		success_url: 'https://example.com/success',
		cancel_url: 'https://example.com/cancel',
	});

	res.json({ url: session.url });
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
