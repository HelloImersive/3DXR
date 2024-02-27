import React,{ useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Divider,
  FooterHelp,
  Tag,
  Icon,
  Banner,
  BannerHandles
} from "@shopify/polaris";
import {authenticate } from "../shopify.server";
import {ProductFilledIcon,ProductIcon} from '@shopify/polaris-icons';
import {AccountConnection} from '@shopify/polaris';
import {useState, useCallback} from 'react';


export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    const sessionShop = session?.shop;
    const sessionState = session?.state;
    const sessionAccesstoken = session?.accessToken;


    const queryParams = new URLSearchParams({ accesstoken:sessionAccesstoken, shop:sessionShop, state:sessionState });
    const apiUrl = `https://apitest.imersive.io/api/ShopifyOAuth/updateaccesstoken?${queryParams}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const product_listings_count = await admin.rest.resources.ProductListing.count({
      session: session,
    });
     
    const product_count = await admin.rest.resources.Product.count({
      session: session,
    });


    const storeinfo = await admin.rest.resources.Shop.all({
      session: session,
      fields: "email,address1,address2,city,province,country",
    })
    const storeemail=storeinfo?.data?.[0]?.email

    const resourcefeedback =  await admin.rest.resources.ResourceFeedback.all({
      session: session,
    });

    const queryParams2 = new URLSearchParams({ shop:sessionShop, email:storeemail });
    const apiUrl2 = `https://apitest.imersive.io/api/Shopify/CLISummary?${queryParams2}`;
    const responseCLI = await fetch(apiUrl2);
    if (!responseCLI.ok) {
      throw new Error(`HTTP error! Status: ${responseCLI.status}`);
    }
    const cliData = await responseCLI.json();

    const userName = cliData?.userName;
    const published_count = cliData?.published;
    const Notpublished_count= cliData?.notPublished;
    const accountStatusFlag = cliData?.accountstatusflag;
    const bulkeditUrl = cliData?.bulkeditUrl;
    const customstoreURL = cliData?.customstoreURL;
    const mobinprogress = cliData.mobinprogress;


    return json({
      oauthsuccess: true, 
      shop:sessionShop, 
      email:storeemail,
      error : "",    
      productlisting_count: product_listings_count.count,
      product_count:product_count.count,
      userName:userName,
      published_count:published_count,
      Notpublished_count:Notpublished_count,
      accountStatusFlag:accountStatusFlag,
      bulkeditUrl:bulkeditUrl,
      resourcefeedback:resourcefeedback,
      customstoreURL:customstoreURL,
      mobinprogress:mobinprogress
     });

  } catch (error) {
    console.error('Error Occurred in Loader:', error);

    return json({
      oauthsuccess: false, 
      shop:"", 
      email:"",
      error : error,
      productlisting_count:0,
      product_count:0,
      userName:"",
      published_count:0,
      Notpublished_count:0,
      accountStatusFlag:0,
      bulkeditUrl:"",
      resourcefeedback:null,
      customstoreURL:"",
      mobinprogress:false
     });
  }

  return null;
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return null;
  
  // const color = ["Red", "Orange", "Yellow", "Green"][
  //   Math.floor(Math.random() * 4)
  // ];
  // const response = await admin.graphql(
  //   `#graphql
  //     mutation populateProduct($input: ProductInput!) {
  //       productCreate(input: $input) {
  //         product {
  //           id
  //           title
  //           handle
  //           status
  //           variants(first: 10) {
  //             edges {
  //               node {
  //                 id
  //                 price
  //                 barcode
  //                 createdAt
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }`,
  //   {
  //     variables: {
  //       input: {
  //         title: `${color} Snowboard`,
  //         variants: [{ price: Math.random() * 100 }],
  //       },
  //     },
  //   }
  // );
  // const responseJson = await response.json();

  // return json({
  //   product: responseJson.data.productCreate.product,
  // });
};





export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const loaderData = useLoaderData();


  const shopResourceFeedback = loaderData.resourcefeedback.data.filter(entry => entry.resource_type === "Shop");
  const resourcefeedback_messages = shopResourceFeedback.flatMap(entry => entry.messages);


  // const submit = useSubmit();
  // const isLoading =
  //   ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
    
  // const productId = actionData?.product?.id.replace(
  //   "gid://shopify/Product/",
  //   ""
  // );

  
  const [shownInitError, setShownInitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const showErrorBanner = (message) => {
    setErrorMessage(message);
    // Optionally, you can set a timeout to clear the message after a certain duration
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000); // Adjust the duration as needed
  };
  const dismissErrorBanner = () => {
    setErrorMessage(null);
  };

  // useEffect(() => {
  //   if (productId) {
  //     shopify.toast.show("Product created");
  //   }
  // }, [productId]);
  // const generateProduct = () => submit({}, { replace: true, method: "POST" });



  // Reload the page
  const reloadPage = () => {
    window.location.reload();
  };

  // const [connected, setConnected] = useState(false);
  const connected = loaderData.accountStatusFlag === 1;
  const accountName = connected ? loaderData.userName : '';
  const shopname = loaderData.shop;
  const email = loaderData.email;
  const signInurl=`https://admin.imersive.io/sign-in/${shopname}`
  const signUpurl=`https://admin.imersive.io/sign-up/${shopname}/${email}`

  // const handleAction = useCallback(() => {
  //   setConnected((connected) => !connected);
  // }, []);

  const handleAction = useCallback(async () => {

    if (loaderData.accountStatusFlag !== 2) {

      const queryParams3 = new URLSearchParams({ shop:loaderData.shop, email:loaderData.email });
      const apiUrl3 = `https://apitest.imersive.io/api/Shopify/UserDisconnect?${queryParams3}`;
      const response3 = await fetch(apiUrl3);
      if (!response3.ok) {
        showErrorBanner("Request Failed! Contact your App provider.")
        // console.log(`HTTP error! Status: ${response3.status}`);
      }
      reloadPage();
      return;
    }


    // if (loaderData.accountStatusFlag === 1) {
    //   setConnected(true);
    // } else {
    //   setConnected(false);
    // }

    //const url = `https://admin.imersive.io/${shopname}/${email}`;
    // const shopname = loaderData.shop;
    // const email = loaderData.email;
    //const url=`https://admin.imersive.io/sign-up/${shopname}/${email}`
    try {

      // Open the URL in a popup window
      const popupWindow = window.open(signUpurl, '_blank', 'width=600,height=700,scrollbars=yes');
  
      // Check if the popup window was blocked
      if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
        throw new Error('Popup window was blocked');
      }

      // Add event listener for messages from child window
      window.addEventListener('message', (event) => {
        const eventData = event.data;

        if (eventData.type === 'signupCompleted') {
          reloadPage();
          return;
        }
      },false);


    } catch (error) {
      // Handle the error, e.g., show a message to the user
      console.error(error);
      alert('Popup window was blocked. Please allow pop-ups for this site.');
    }

  }, []);



  const totalproducts=loaderData.product_count;
  const totallistedproducts=loaderData.productlisting_count;
  const totalpublished=loaderData.published_count;
  const totalNotpublished=totallistedproducts-totalpublished;
  const bulkproducteditURL =loaderData.bulkeditUrl;
  const customstoreUrl = loaderData.customstoreURL;
  const MOBInprogressflag = loaderData.mobinprogress;

  
  if (!loaderData.oauthsuccess && !shownInitError){
    showErrorBanner(loaderData.error)
    setShownInitError(true);
  }


  const buttonText = connected ? 'Disconnect' : 'Connect';
  // const details = connected ? 'Account connected' : 'No account connected';

  const details = connected ?  (
    <>  
    {customstoreUrl && (
      <>
      <Link url={`https://${customstoreUrl}`}  target="_blank">{customstoreUrl}</Link>
      <br/>
      </>  
    )}
    <p>Account connected  </p>
   
    {(customstoreUrl==="" && MOBInprogressflag === false)  && (

        <p>Visit Merchant onboarding page</p>
        )}

    </>
  ) :  (
    <p>
      No account connected
    </p>
  );



  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you consent to the 3D XR Store’s{' '}
      <Link url="https://demo.imersive.io/privacy/terms.html" target="_blank" >terms and conditions</Link>. 
    </p>
  );



  
  return (
    <Page>
      <ui-title-bar title="Welcome to 3D XR Store">
        {/* <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button> */}
      </ui-title-bar>

    {errorMessage && (
            <Banner  title="Error! Contact your app provider." tone="critical" onDismiss={dismissErrorBanner} >
              {JSON.stringify(errorMessage)}
            </Banner>
            
          )}

   


    {(MOBInprogressflag === true || (resourcefeedback_messages && resourcefeedback_messages.length > 0)) && (
        <Banner title="Feedback from 3D XR Store" tone="info">
            <ul>
                {resourcefeedback_messages && resourcefeedback_messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}

                {MOBInprogressflag === true && (
                    <li>There are pending actions to complete your onboarding. Visit the <strong>Merchant onboarding</strong> page.</li>
                )}
            </ul>
        </Banner>
    )}




      <div style={{ margin: '16px' }} /> {/* Add a gap using a div with margin */}
      <Layout marginTop="200">
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <Text id="storeDetails" variant="headingMd" as="h2">
              Your account
            </Text>
            <Text tone="subdued" as="p">
              Connect your Shopify store catalog to our virtual 3D XR Store.
            </Text>
          </div>
        </Layout.Section>
      
        <Layout.Section>

            <AccountConnection
              accountName={accountName}
              connected={connected}
              title="3D XR Store"
              action={{
                content: buttonText,
                onAction: handleAction,
              }}
              details={details}
              termsOfService={terms}
            />

        </Layout.Section>
      </Layout>


      <Divider/>
      <div style={{ margin: '16px' }} /> {/* Add a gap using a div with margin */}

      <Layout>
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <Text id="FAQs" variant="headingMd" as="h2">
              FAQs
            </Text>
            <Text tone="subdued" as="p">
              Everything you need to know to make the best use of our 3D XR Store app.
            </Text>
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card >
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  How do I select products to display in the 3D store?
                </Text>
                <Text as="p" variant="bodyMd">
                 After installing the app, go to the admin page where you will see a list of your Shopify products. You can select the specific products you want to display by checking the boxes next to each product or setting a specific number of products to include in your 3D store.
                </Text>
              </BlockStack>
              <InlineStack align="end">
                 <Button url="https://demo.imersive.io/privacy/faqs.html" target="_blank" variant="plain">more</Button>
              </InlineStack>
            </BlockStack>
          </Card>

        </Layout.Section>
      </Layout>

      <Divider/>
      <div style={{ margin: '16px' }} /> {/* Add a gap using a div with margin */}
      <Layout >
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <Text id="pricing" variant="headingMd" as="h2">
            Pricing
            </Text>
            <Text tone="subdued" as="p">
            Custom pricing
            </Text>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Card >
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="bodyMd">
                <strong>$99 (USD) per month</strong> is the minimum hosting and maintenance fee. This may
                increase depending on hosting volumes and on a case to case basis for custom builds.
                </Text>
                <Text as="p" variant="bodyMd">
                <strong>3% Transaction Fee</strong> taken on each sale generated from the 3D XR
                Store. Please see Finance tab to see details after connecting your store.
                </Text>
                <Text as="p" variant="bodyMd">
                <strong>One-time Fee</strong> is the service cost to deploy a custom 3D XR Store. This cost is dependant on merchant / brand requirements. This fee is calculated based on square footage area of your virtual space at rate of <strong>$3.75 (USD) per sq.ft.</strong> The minimum area for a virtual space is 1000 sq.ft.
                </Text>
                <Text as="p" variant="bodyMd">You shall be informed of actual charges for your custom virtual store configuration during merchant onboarding and will have to approve the charges.</Text>
              </BlockStack>
              {/* <InlineStack align="end">
                 <Button url="https://demo.imersive.io/privacy/privacy.html" target="_blank" variant="plain">view Pricing</Button>
              </InlineStack> */}
            </BlockStack>
          </Card>

        </Layout.Section>
      </Layout>

      <Divider/>
      <div style={{ margin: '16px' }} /> {/* Add a gap using a div with margin */}
      <Layout gap="500" >
        <Layout.Section variant="oneThird">
          <div style={{ marginTop: "var(--p-space-500)" }}>
            <Text id="pricing" variant="headingMd" as="h2">
            Publishing 
            </Text>
            <Text tone="subdued" as="p">
            Products that are being synced from your catalog to the 3D XR Store with their 3D link status.
            </Text>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Card >
            <BlockStack gap="500">
              <BlockStack>
                  <BlockStack>
                  <Text as="h2" variant="headingSm">
                  Products
                  </Text>
                  <InlineStack align="end">
                  <Button url={bulkproducteditURL} target="_blank" variant="plain">manage</Button>
                  </InlineStack>
                </BlockStack>

                <BlockStack gap="200">
                <Text as="h2" variant="bodyMd">
                  <strong>{totallistedproducts}</strong> of {totalproducts} products are enabled in the 3D XR Store.
                </Text>
                </BlockStack>
              </BlockStack>

            </BlockStack>

            <Divider/>
            <div style={{ margin: '16px' }} /> {/* Add a gap using a div with margin */}

            <BlockStack gap="200">
            <InlineStack gap="200">
                <Tag url="#"  >
                  <BlockStack>
                  <InlineStack spacing="extraTight">
                    <Icon source={ProductFilledIcon} />
                    <span>published</span>
                  </InlineStack>
                  </BlockStack>
                </Tag>
                <Text as="h2" variant="bodyMd">
                    <strong>{totalpublished}</strong> products
                </Text>
            </InlineStack>
            <InlineStack gap="200">
                <Tag url="#">
                  <BlockStack>
                  <InlineStack spacing="extraTight">
                    <Icon source={ProductIcon} />
                    <span>Not published</span>
                  </InlineStack>
                  </BlockStack>
                </Tag>
                <Text as="h2" variant="bodyMd">
                    <strong>{totalNotpublished}</strong> products
                </Text>
            </InlineStack>
            </BlockStack>



          </Card>

        </Layout.Section>


      </Layout>


      <FooterHelp>
        For any enquiries login and contact Imersive from your{' '}
        <Link url={signInurl} target="_blank" variant="plain">
             client environment
        </Link>
      </FooterHelp>       
    
    </Page>
  );
}


