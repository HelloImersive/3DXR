import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(
    request
  );

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      await insert_webhook_app_uninstall(shop,payload);
      break;

    case "CUSTOMERS_DATA_REQUEST":
      await insert_webhook_customer_datarequest(shop,payload);
      break;

    case "CUSTOMERS_REDACT":
      await insert_webhook_customer_redact(shop,payload);
      break;

    case "SHOP_REDACT":
      await insert_webhook_shop_redact(shop,payload);
      break;

    case "ORDERS_CREATE":
      await sync_order_single(shop,payload);
      break;

    case "APP_SUBSCRIPTIONS_UPDATE":
        await insert_webhook_subscription_update(shop,payload);
        break;
        
    case "ORDERS_DELETE":
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};

async function sync_order_single(shop,payload) {
  try {
   

    const orderData = payload;
    const orderId  =  orderData.id;
    const orderName  = orderData.name;


    const apiUrl = `https://apitest.imersive.io/api/Shopify/OrderSyncSingle`;
    const response = fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        Shop: shop,
        id: orderId,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;

  } catch (error) {
    console.error('Error during API call:', error);
    return null;
  }
}

async function insert_webhook_subscription_update(shop,payload) {
  try {
   
    const apiUrl = `https://apitest.imersive.io/api/Shopify/WH/Subscription/Update`;
    const response = fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        shop: shop,
        request: payload,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;

  } catch (error) {
    console.error('Error during API call:', error);
    return null;
  }
}

async function insert_webhook_customer_datarequest(shop,payload) {
  try {
   
    const { shop_id, shop_domain, orders_requested, customer, data_request } = payload;
    const shopid=shop_id;
    const orders=orders_requested;
    const customerid=customer.id;
    const email=customer.email;
    const phone=customer.phone;
    const requestid=data_request.id;


    const queryParams = new URLSearchParams({ shop,shopid,orders,customerid,email,phone,requestid });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/WHCustomerDataRequest?${queryParams}`;
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

async function insert_webhook_customer_redact(shop,payload) {
  try {
    const { shop_id, shop_domain, customer, orders_to_redact } = payload;
    const shopid=shop_id;
    const orders=orders_to_redact;
    const customerid=customer.id;
    const email=customer.email;
    const phone=customer.phone;


    const queryParams = new URLSearchParams({ shop,shopid,orders,customerid,email,phone });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/WHCustomerRedAct?${queryParams}`;
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

async function insert_webhook_shop_redact(shop,payload) {
  try {
   
    const { shop_id, shop_domain } = payload;
    const shopid = shop_id;
    const queryParams = new URLSearchParams({ shop,shopid });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/WHShopRedAct?${queryParams}`;
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

async function insert_webhook_app_uninstall(shop,payload) {
  try {
   
    const apiUrl = `https://apitest.imersive.io/api/Shopify/WH/Uninstall`;
    const response = fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        shop: shop,
        request: payload,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;

  } catch (error) {
    return null;
  }
}

