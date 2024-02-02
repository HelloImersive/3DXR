
import React, {useState, useCallback,useEffect} from 'react';
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit,useLocation  } from "@remix-run/react";
import {
    Box,
    Card,
    Layout,
    Link,
    List,
    Page,
    Text,
    BlockStack,
    Button,
    TextStyle,
    Collapsible,
    Icon,
    InlineStack,
    InlineGrid,
    ProgressBar,
    MediaCard

  } from "@shopify/polaris";
  import {PlusCircleIcon} from '@shopify/polaris-icons';
  import {authenticate } from "../shopify.server";
import MOBProduct from './mob_product';
import MOBRoomInputs from './mob_roominput';
import MOBRoom from './mob_reviewdemo';
import MOBReviewDemo from './mob_reviewdemo';
import MOBCustomStore from './mob_customstore';
import MOBPayment from './mob_payment';
import MOBTest from './mob_test';



export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const sessionShop = session?.shop;
    const sessionAccesstoken = session?.accessToken;

    const productlisting = await admin.rest.resources.ProductListing.all({
      session: session,
    });

    return {oauthsuccess:true,  shop:sessionShop, accesstoken:sessionAccesstoken, productlisting:productlisting}
    

  } catch (error) {
    console.error('Error Occurred in Loader:', error);

    return {
      oauthsuccess:false,
      shop:null, 
      accesstoken:null,
      productlisting:null
    }
  }

  return null;
};



  export default function StoreSetup() {
    
    const [open, setOpen] = useState(true);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    const loaderData = useLoaderData();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const chargeId = queryParams.get('charge_id');



    const [mobstatus, setMOBStatus] = useState(null);
    const [currentMobStatus, setCurrentMobStatus] = useState(null);


    const [togglestateopen_product, settogglestateopen_product] = useState(false);
    const [processstateflag_product, setprocessstateflag_product] = useState(3);

    const fetchStatus = async () => {
      try {


        if (chargeId>0) {

          const queryParams4 = new URLSearchParams({ shop:loaderData.shop , chargeID: chargeId });
          const apiUrl4 = `https://apitest.imersive.io/api/Shopify/AC/UpdateChargeStatus?${queryParams4}`;
          const response4 = await fetch(apiUrl4);

          const queryParams6 = new URLSearchParams({ shop:loaderData.shop , chargeID: chargeId });
          const apiUrl6 = `https://apitest.imersive.io/api/Shopify/RC/UpdateChargeStatus?${queryParams6}`;
          const response6 = await fetch(apiUrl6);
         

        }

        const queryParams3 = new URLSearchParams({ Shop:loaderData.shop });
        const apiUrl3 = `https://apitest.imersive.io/api/ShopifyMOB/GetStatus?${queryParams3}`;
        const response3 = await fetch(apiUrl3);
        if (!response3.ok) {
          // showErrorBanner("Request Failed! Contact your App provider.")
          throw new Error('Network response was not ok');
        }
       // console.log(`response3: ${response3.json()}`)
        const data = await response3.json();
        if (data.isSuccess){ 
             setMOBStatus(data.result);
        }

      } catch (error) {
        console.error('Fetch error:', error);
      }
    };


    const handleMOBProduct_Proceed = async (data) => {
      await save_MOB_product(
        {
          shop:loaderData.shop,
          products:data
        });

      await  update_MOB_status( {
          shop:loaderData.shop,
          status:"PROD_PUBLISH_COMPLETED",
          charges:[]
        });

      await  update_MOB_status( {
          shop:loaderData.shop,
          status:"ROOM_CONFIG_PENDING",
          charges:[]
        });

      setCurrentMobStatus("ROOM_CONFIG_PENDING");
     
    };

    const handleMOBRoom_Proceed = async (data) => {

      await  save_MOB_room(
        {
          shop:loaderData.shop,
          rooms:data
        });

      await update_MOB_status( {
          shop:loaderData.shop,
          status:"ROOM_CONFIG_COMPLETED",
          charges:[]
        });


      await  update_MOB_status( {
          shop:loaderData.shop,
          status:"DEMO_STORE_WIP",
          charges:[]
        });

      setCurrentMobStatus("DEMO_STORE_WIP");


    };

    const handleReviewDemo_Proceed = async (data) => {

      await update_MOB_status( {
          shop:loaderData.shop,
          status:"DEMO_STORE_READY_REVIEW_COMPLETED",
          charges:[]
        });

      setCurrentMobStatus("DEMO_STORE_READY_REVIEW_COMPLETED");

      await update_success_resourcefeedback( {
        shop:loaderData.shop,
      });

    };

    const handleCustomStore_AdvancePaymentProceed = async (data) => {


      const base_url = document.referrer;
      const shopid  = loaderData.shop.replace('.myshopify.com','');
      const relative_url = '/store/<shopid>/apps/3d-xr-store-sales-channel/app/storesetup';
      const full_url = new URL(relative_url.replace('<shopid>', shopid), base_url).href;
      // console.log('Current redirect URL:', full_url);


      const advPaymet = await api_createApplicationCharge(
        {
          shop:loaderData.shop, 
          chargename:"3D XR Custom Store Advance Payment",
          value : mobstatus.customStore.adV_value,
          returnURL:full_url
        }
      );


      if (advPaymet.chargID>0){

        const apiresp = JSON.stringify(advPaymet.response);
        const chargeValue = parseFloat(advPaymet.price);

        await update_MOB_status( {
            shop:loaderData.shop,
            status:"PAYMENT_ADVANCE_TRIGGERED",
            charges:[{
              charge_type:"ADVANCE",
              charge_id:advPaymet.chargID,
              charge_value:chargeValue,
              charge_response:apiresp,
            }]
          });

        setCurrentMobStatus("PAYMENT_ADVANCE_TRIGGERED");

        window.open(advPaymet.confirmURL, '_parent');

        await update_success_resourcefeedback( {
          shop:loaderData.shop,
        });

      }


    };

    const handlePayment_BalancePaymentProceed = async (data) => {


      const base_url = document.referrer;
      const shopid  = loaderData.shop.replace('.myshopify.com','');
      const relative_url = '/store/<shopid>/apps/3d-xr-store-sales-channel/app/storesetup';
      const full_url = new URL(relative_url.replace('<shopid>', shopid), base_url).href;
      // console.log('Current redirect URL:', full_url);


      const balPayment = await api_createApplicationCharge(
        {
          shop:loaderData.shop, 
          chargename:"3D XR Custom Store Balance Payment",
          value : mobstatus.payment.baL_value,
          returnURL:full_url
        }
      );


      if (balPayment.chargID>0){

        const apiresp = JSON.stringify(balPayment.response);
        const chargeValue = parseFloat(balPayment.price);

        await update_MOB_status( {
            shop:loaderData.shop,
            status:"PAYMENT_BALANCE_TRIGGERED",
            charges:[{
              charge_type:"BALANCE",
              charge_id:balPayment.chargID,
              charge_value:chargeValue,
              charge_response:apiresp,
            }]
          });

        setCurrentMobStatus("PAYMENT_BALANCE_TRIGGERED");

        window.open(balPayment.confirmURL, '_parent');

        await update_success_resourcefeedback( {
          shop:loaderData.shop,
        });

      }

     

    };

    const handlePayment_RCPaymentProceed = async (data) => {

      const base_url = document.referrer;
      const shopid  = loaderData.shop.replace('.myshopify.com','');
      const relative_url = '/store/<shopid>/apps/3d-xr-store-sales-channel/app/storesetup';
      const full_url = new URL(relative_url.replace('<shopid>', shopid), base_url).href;
      // console.log('Current redirect URL:', full_url);


      const RCPayment = await api_createRecurringCharge(
        {
          shop:loaderData.shop, 
          chargename:"3D XR Custom Store Monthly Charges",
          value : mobstatus.payment.rC_value,
          returnURL:full_url
        }
      );


      if (RCPayment.chargID>0){

        const apiresp = JSON.stringify(RCPayment.response);
        const chargeValue = parseFloat(RCPayment.price);

        await update_MOB_status( {
            shop:loaderData.shop,
            status:"PAYMENT_RC_TRIGGERED",
            charges:[{
              charge_type:"RC",
              charge_id:RCPayment.chargID,
              charge_value:chargeValue,
              charge_response:apiresp,
            }]
          });

        setCurrentMobStatus("PAYMENT_RC_TRIGGERED");

        window.open(RCPayment.confirmURL, '_parent');

        await update_success_resourcefeedback( {
          shop:loaderData.shop,
        });
        
      }

 
    };


   useEffect(() => {
      fetchStatus();
  }, [currentMobStatus]); // Depend on currentMobStatus


    useEffect(() => {
      // Update currentMobStatus when mobstatus changes
      if (mobstatus && mobstatus.store && mobstatus.store.current_mob_status) {
        setCurrentMobStatus(mobstatus.store.current_mob_status);
        
      }
    }, [mobstatus]); // Depend on mobstatus
 

    
    return (

        <Page
        // backAction={{content: 'Home', url: '/app'}}
        title="Setup your store"
        subtitle="3D XR Store Merchant onboarding"
        compactTitle
        >
        {/* <ui-title-bar title="Setup your store" /> */}

        {mobstatus && (
        <>

          <InlineStack  gap="1000" align="end">
              
              {!mobstatus.store.allow_MOB_finish && (
                <ProgressBar progress={mobstatus.store.progressPercent} tone="success" />
              )}
               <br/>

          </InlineStack>


          <Layout>
            <Layout.Section>
              <MOBProduct 
              productlisting={loaderData.productlisting} 
              togglestateopen={mobstatus.product.toggleopen} 
              processstateflag={mobstatus.product.iconProcessstateflag}
              onProceed={handleMOBProduct_Proceed} />

            </Layout.Section>
            <Layout.Section>
              <MOBRoomInputs 
                togglestateopen={mobstatus.roomConfig.toggleopen}
                processstateflag={mobstatus.roomConfig.iconProcessstateflag}
                ratepersqft={mobstatus.roomConfig.ratepersqft}
                onProceed={handleMOBRoom_Proceed} 
                  />
            </Layout.Section>

            <Layout.Section>
              <MOBReviewDemo              
              togglestateopen={mobstatus.reviewDemo.toggleopen} 
              processstateflag={mobstatus.reviewDemo.iconProcessstateflag} 
              currentstatus = {mobstatus.store.current_mob_status}
              onProceed={handleReviewDemo_Proceed}
              demostoreURL = {mobstatus.store.demo_store_URL}   />
              
            </Layout.Section>

            <Layout.Section>
              <MOBCustomStore              
              togglestateopen={mobstatus.customStore.toggleopen} 
              processstateflag={mobstatus.customStore.iconProcessstateflag}
              currentstatus = {mobstatus.store.current_mob_status}
              onAdvPaymentProceed={handleCustomStore_AdvancePaymentProceed}
              adV_value= {mobstatus.customStore.adV_value}
              adV_chargeID= {mobstatus.customStore.adV_chargeID}
              adV_chargestatus= {mobstatus.customStore.adV_chargestatus}
              adV_allowtrigger= {mobstatus.customStore.adV_allowtrigger}
              total_bil_value = {mobstatus.store.total_bil_value}
              total_products = {mobstatus.product.products.length}
              rooms= {mobstatus.roomConfig.rooms}
              />
            </Layout.Section>
            <Layout.Section>
              <MOBPayment              
              togglestateopen={mobstatus.payment.toggleopen} 
              processstateflag={mobstatus.payment.iconProcessstateflag}
              currentstatus = {mobstatus.store.current_mob_status}
              onBalPaymentProceed={handlePayment_BalancePaymentProceed}
              onRCPaymentProceed={handlePayment_RCPaymentProceed}
              baL_value= {mobstatus.payment.baL_value}
              baL_chargeID= {mobstatus.payment.baL_chargeID}
              baL_chargestatus= {mobstatus.payment.baL_chargestatus}
              baL_allowtrigger= {mobstatus.payment.baL_allowtrigger}
              rC_value= {mobstatus.payment.rC_value}
              rC_chargeID= {mobstatus.payment.rC_chargeID}
              rC_chargestatus= {mobstatus.payment.rC_chargestatus}
              rC_allowtrigger= {mobstatus.payment.rC_allowtrigger}
              customstoreURL = {mobstatus.store.custom_store_URL}  
              />
            </Layout.Section>


          </Layout>

          <br/>

            {mobstatus.store.allow_MOB_finish && (
              
              <Card>
                <BlockStack>
                <Text as="h1" variant="headingLg">Congratulations!</Text>
                <Text as="h2" variant="bodyLg">Your 3D XR Virtual Store is now live. Visit <Link url={`https://${mobstatus.store.custom_store_URL}`}  target="_blank">{mobstatus.store.custom_store_URL}</Link></Text>
                
                </BlockStack>
          
              
              </Card>

            )}

                
        </>
        )}



      </Page>
    );
  }
   

  
function Code({ children }) {
    return (
      <Box
        as="span"
        padding="025"
        paddingInlineStart="100"
        paddingInlineEnd="100"
        background="bg-surface-active"
        borderWidth="025"
        borderColor="border"
        borderRadius="100"
      >
        <code>{children}</code>
      </Box>
    );
  }
  

  
async function save_MOB_product({shop,products}) {
  try {

    const apiUrl = `https://apitest.imersive.io/api/ShopifyMOB/SaveProducts`;
    const response =await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        Shop: shop,
        Data: products,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;

  } catch (error) {
    return false;
  }
}


async function save_MOB_room({shop,rooms}) {
  try {
   
    const apiUrl = `https://apitest.imersive.io/api/ShopifyMOB/SaveRooms`;
    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        Shop: shop,
        Data: rooms,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;

  } catch (error) {
    return false;
  }
}


async function update_MOB_status({shop,status,charges}) {
  try {
   

    const apiUrl = `https://apitest.imersive.io/api/ShopifyMOB/UpdateStatus`;
    const response =await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        Shop: shop,
        Status: status,
        Charges: charges,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });
    // console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;

  } catch (error) {
    return false;
  }
}


async function update_success_resourcefeedback({shop}) {
  try {
   
    const apiUrl = `https://apitest.imersive.io/api/Shopify/ResourceFeedback/Create`;
    const response =await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        shop: shop,
        state: "success",
        messages: [],
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;

  } catch (error) {
    return false;
  }
}


async function api_createApplicationCharge({shop,chargename,value,returnURL}) {
  try {
    const apiUrl = `https://apitest.imersive.io/api/Shopify/AC/Create`;
    const response =await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        shop: shop,
        name: chargename,
        price: value,
        returnURL:returnURL,
        test:true,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });



    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response data as JSON
    const responseData = await response.json();


    return {
      confirmURL: responseData.application_charge.confirmation_url,
      response : responseData.application_charge,
      chargID : responseData.application_charge.id,
      price: responseData.application_charge.price
    };

  } catch (error) {
      return {
        confirmURL: '',
        response : '',
        chargID : 0,
        price: 0
        };
  }
}



async function api_createRecurringCharge({shop,chargename,value,returnURL}) {
  try {
    const apiUrl = `https://apitest.imersive.io/api/Shopify/RC/Create`;
    const response =await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        shop: shop,
        name: chargename,
        price: value,
        returnURL:returnURL,
        test:true,
      }),
      headers: {
        "Content-type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response data as JSON
    const responseData = await response.json();

    return {
      confirmURL: responseData.recurring_application_charge.confirmation_url,
      response : responseData.recurring_application_charge,
      chargID : responseData.recurring_application_charge.id,
      price: responseData.recurring_application_charge.price
    };

  } catch (error) {
      return {
        confirmURL: '',
        response : '',
        chargID : 0,
        price: 0
        };
  }
}




const createApplicationCharge = async ({shop, accessToken,chargename,value,returnURL}) => {

  const client = new Shopify.Clients.Rest({shop:shop, accessToken:accessToken});
  const data = {
    // Define your application charge details here
    application_charge: {
      name: chargename,
      price: value,
      currency:"USD",
      return_url: returnURL,
      test: true, // Set to false in production
    }
  };
  
  const response = await client.post({
    path: 'application_charge',
    data: data,
    type: Shopify.DataType.JSON,
  });


  return {
   confirmURL: response.body.application_charge.confirmation_url,
   response : response,
   chargID : response.body.application_charge.id,
   price: response.body.application_charge.price
   };
};


const createRecurringCharge = async ({shop, accessToken,chargename,value,termdecription,returnURL}) => {
  const client = new Shopify.Clients.Rest({shop:shop, accessToken:accessToken});
  const data = {
    // Define your application charge details here
    recurring_application_charge: {
      name: chargename,
      price: value,
      currency:"USD",
      capped_amount:999999.99,
      return_url: returnURL,
      test: true, // Set to false in production
      trial_days:0,
      terms:termdecription,
    }
  };

  const response = await client.post({
    path: 'recurring_application_charges',
    data: data,
    type: Shopify.DataType.JSON,
  });

  
  return {
    confirmURL: response.body.recurring_application_charge.confirmation_url,
    response : response,
    chargID : response.body.recurring_application_charge.id,
    price: response.body.recurring_application_charge.price
    };
};


