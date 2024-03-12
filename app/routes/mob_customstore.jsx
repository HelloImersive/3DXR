import React, { useState, useCallback,useEffect } from "react";
import {
  Layout,
  ResourceList,
  Avatar,
  ResourceItem,
  Text,
  Card,
  BlockStack,
  DataTable,
  InlineStack ,
  Popover,
  FormLayout,
  Button,
  Collapsible,
  Icon,
  TextField,
  Checkbox,
} from "@shopify/polaris"
import { AlertDiamondIcon,AlertCircleIcon,CheckCircleIcon,ClockIcon } from "@shopify/polaris-icons";

function MOBCustomStore({togglestateopen,processstateflag,currentstatus,onAdvPaymentProceed,adV_value,adV_chargeID,adV_chargestatus,adV_allowtrigger,total_bil_value,total_products,rooms,onNextProceed}) {

  const [open, setOpen] = useState(togglestateopen);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const [currentstatusflag, setCurrentstatus] = useState(currentstatus);

  const [param_adV_value, setadV_value] = useState(adV_value);
  const [param_adV_chargeID, setadV_chargeID] = useState(adV_chargeID);
  const [param_adV_chargestatus, setadV_chargestatus] = useState(adV_chargestatus);
  const [param_adV_allowtrigger, setadV_allowtrigger] = useState(adV_allowtrigger);
  const [param_total_bil_value, settotal_bil_value] = useState(total_bil_value);
  const [param_rooms, setrooms] = useState(rooms);
  const [param_total_products, settotal_products] = useState(total_products);
 
  // Use useEffect to react to changes in togglestateopen
  useEffect(() => {
    setOpen(togglestateopen);
  }, [togglestateopen]);

  useEffect(() => {
    setCurrentstatus(currentstatus);
  }, [currentstatus]);


  const getIcon = () => {
    if (processstateflag === 3) {
      return <Icon source={CheckCircleIcon} tone="success" />;
    } else if (processstateflag === 2) {
      return <Icon source={ClockIcon} tone="warning" />;
    } else if (processstateflag === 1) {
      return <Icon source={AlertCircleIcon} tone="critical" />;
    } else {
      return <Icon source={AlertDiamondIcon} tone="critical" />;
    }
  };

  const handleAdvPaymentClick = () => {
    
    onAdvPaymentProceed();
  
  };

  const handleAdvWithoutPaymentClick = () => {
    
    onNextProceed();
  
  };

  return (
    <Card>

      <BlockStack>
        <BlockStack inlineAlign="start">
          <InlineStack gap="400">
          {getIcon()}
            <Text as="h3" variant="headingSm">
            Review your Custom 3D XR Store
            </Text>
            {/* <Button
               variant="plain"
              onClick={handleToggle}
              ariaExpanded={open}
              ariaControls="basic-collapsible"
            >
              Toggle
            </Button> */}
          </InlineStack>
        </BlockStack>

        
        <Collapsible
          open={open}
          id="basic-collapsible"
          transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
          expandOnPrint
        >
           <BlockStack gap="200">
                <br />

             {currentstatusflag!="CUSTOM_STORE_WIP" && (
             <>

                  <Text as="p" variant="bodyMd">
                  Thank you for your request to build a custom 3D XR Store. We summarize your requirement below for confirmation.
                  </Text>

                <ul>
                      {/* {param_rooms.map((room, index) => (
                      <li key={index}>{room.name} - {room.size} sq.ft</li>
                      ))} */}

                      <li> <strong>{param_total_products} products </strong>selected for 3D enabling </li>
                      <li> <strong>{param_rooms.length} room(s)</strong> configured  </li>
                      <li> <strong>{param_rooms.reduce((subTotal, room) => subTotal + room.size, 0)} sq.ft. </strong> of virtual space in total </li>
                  </ul>

               
                  {adV_value>0 && (
                  <>
                      <Text as="p" variant="bodyMd">
                      Your  one-time bill is <strong> ${param_total_bil_value} USD</strong>. 
                      </Text>
                      <Text as="p" variant="bodyMd">
                        Proceed to Charge Approval to approve the upfront one-time charges (<strong>${param_adV_value} USD</strong> rounded) to start construction of your Custom 3D XR Store.
                      </Text>
                      
                      
                      {param_adV_allowtrigger && (
                      <InlineStack align="end">
                          <Button variant="primary" onClick={handleAdvPaymentClick} >Proceed to Charge Approval</Button>
                      </InlineStack>
                      )}  
                  </>
                  )}  

                {adV_value<=0 && (
                <>
                      <InlineStack align="end">
                          <Button variant="primary" onClick={handleAdvWithoutPaymentClick} >I approve to Construct Custom 3D XR Store</Button>
                      </InlineStack>

                </>
                )}  

            </>
            )}  

            {currentstatusflag==="CUSTOM_STORE_WIP" && (
             <>
            
             <Text as="p" variant="bodyMd">
                Your Custom 3D XR Store <strong>under construction.</strong> You will receive an email from Imersive once it is ready. Please check this page for status updates.
              </Text>
           
              </>
            )}  






            </BlockStack>
        </Collapsible>


      </BlockStack>



    </Card>
  )


}


export default MOBCustomStore;