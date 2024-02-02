import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
  } from "@remix-run/react";
  import {LoaderFunctionArgs} from '@remix-run/node';
  import {AppProvider} from '@shopify/shopify-app-remix/react';

  
export default function Welcome() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <h1>Welcome to 3D XR Store. </h1>
          {/* <Outlet />
          <ScrollRestoration />
          <LiveReload />
          <Scripts /> */}
        </body>
      </html>
    );
  }