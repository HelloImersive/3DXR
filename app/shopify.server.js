import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import prisma from "./db.server";


const express = require('express');
const app = express();
const port = process.env.PORT || 8081;//LIVE
//const port = 3000;//TEST
const Shopifyapp = require('@shopify/shopify-api');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


const crypto = require('crypto');
const axios = require('axios');

function generateRandomString() {
  return crypto.randomBytes(32).toString('hex');
}


// The route for getting the React frontend
app.get('/', (req, res) => {
  res.send('Welcome');
  console.log(`Welcome`);
});

app.get('/welcome', (req, res) => {
  res.send('Welcome to imersive');
  console.log(`Welcome to imersive`);
});


app.get('/install', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const state = generateRandomString();
  //const redirectUri = `${process.env.np}/auth/callback`; //Live
  const redirectUri = `https://3dxrapp.com/auth/callback`; //TEST
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

  // Save the state parameter in your database with an association to the shop
  //await saveStateToDatabase(shop, state);

  // console.log(`install Shop:${shop}`);
  // console.log(`install State:${state}`);
  // console.log(`install URL:${installUrl}`);



  res.redirect(installUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { shop, code, state } = req.query;

  // console.log(`callback Shop:${shop}`);
  // console.log(`callback Code:${code}`);
  // console.log(`callback State:${state}`);

  // Verify the state parameter
  // const savedState = await getStateFromDatabase(shop);
  // if (state !== savedState) {
  //   return res.status(400).send('Invalid state parameter');
  // }

  const apistatus_callback =  await saveauthorizationcode_imersivedb(code, shop, state);
  // console.log(`save authorizationcode to imersive db:${apistatus_callback}`);

  // Exchange the authorization code for an access token
  const accessToken = await exchangeAuthorizationCodeForAccessToken(shop, code);
  // console.log(`callback access token:${accessToken}`);

  const apistatus_accesstoken =  await update_accesstoken_imersivedb(accessToken, shop, state);
  // console.log(`update accesstoken to imersive db:${apistatus_accesstoken}`);

  // Redirect to the app's main page
  //res.redirect(`/?shop=${shop}`); //LIVE
  res.redirect('https://admin.imersive.io/sign-in/'+shop+'/true/')
});



async function exchangeAuthorizationCodeForAccessToken(shop, code) {
  const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
    client_id: process.env.SHOPIFY_API_KEY,
    client_secret: process.env.SHOPIFY_API_SECRET,
    code,
  });

  return response.data.access_token;
}


async function saveauthorizationcode_imersivedb(code, shop, state) {
  try {
   
    const queryParams = new URLSearchParams({ code, shop, state });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/callback?${queryParams}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;

  } catch (error) {
    console.error('Error during API call:', error);
    return null;
  }
}


async function update_accesstoken_imersivedb(accesstoken, shop, state) {
  try {
   
    const queryParams = new URLSearchParams({ accesstoken, shop, state });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/updateaccesstoken?${queryParams}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;

  } catch (error) {
    console.error('Error during API call:', error);
    return null;
  }
}


app.post('/webhook/customers/data_request', (req, res) => {
  const { shop_id, shop_domain, orders_requested, customer, data_request } = req.body;


  // console.log('Data Request Webhook Received:');
  // console.log(`Shop ID: ${shop_id}`);
  // console.log(`Shop Domain: ${shop_domain}`);
  // console.log(`Orders Requested: ${orders_requested}`);
  // console.log(`Customer ID: ${customer.id}`);
  // console.log(`Customer Email: ${customer.email}`);
  // console.log(`Customer Phone: ${customer.phone}`);
  // console.log(`Data Request ID: ${data_request.id}`);


  res.status(200).send('Webhook received successfully');
});




app.post('/webhook/customers/redact', (req, res) => {
  const { shop_id, shop_domain, customer, orders_to_redact } = req.body;

  // console.log('Customer Redaction Webhook Received:');
  // console.log(`Shop ID: ${shop_id}`);
  // console.log(`Shop Domain: ${shop_domain}`);
  // console.log(`Customer ID: ${customer.id}`);
  // console.log(`Customer Email: ${customer.email}`);
  // console.log(`Customer Phone: ${customer.phone}`);
  // console.log(`Orders to Redact: ${orders_to_redact}`);

  // After performing redaction, send a response back to Shopify
  res.status(200).send('Customer data redaction initiated');
});



app.post('/webhook/shop/redact', (req, res) => {
  const { shop_id, shop_domain } = req.body;

  // console.log('Shop Redaction Webhook Received:');
  // console.log(`Shop ID: ${shop_id}`);
  // console.log(`Shop Domain: ${shop_domain}`);

  res.status(200).send('Shop data redaction processed');
});




const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "https://3dxrapp.com/",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
