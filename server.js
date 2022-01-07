if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const express = require("express");

const app = express();

const fs = require("fs");
const stripe = require("stripe")(stripeSecretKey);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/ice", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      res.render("ice.ejs", {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data),
      });
    }
  });
});

app.post("/create-checkout-session", async (req, res) => {
  const itemsJson = "";
  const itemsArray = [];
  let total = 2000;

  console.log(res);

  // let cartItems = document.getElementsByClassName("cart-items")[0];

  // for (let i = 0; i > cartItems.length; i++) {
  //   itemsArray.push({
  //     price_data: {
  //       currency: "eu",
  //       product_data: {
  //         name: cartItems[i].getElementsByClassName("cart-item-title"),
  //       },
  //       unit_amount: cartItems[i].getElementsByClassName("cart-price"),
  //     },
  //     quantity: cartItems[i].getElementsByClassName("cart-quantity"),
  //   });
  // }

  /*fs.readFile('items.json', function(error, data) {
    if (error) {
      res.status(500).end()
    } else {
      itemsJson = JSON.parse(data)
      itemsArray = itemsJson.music.concat(itemsJson.icecreams)
      total = 0
      req.body.items.forEach(function(item) {
        const itemJson = itemsArray.find(function(i) {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
      })
    }
  }) */

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Ice cream",
          },
          unit_amount: total,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  console.log(session);

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
