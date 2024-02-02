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
  Link,
} from "@shopify/polaris"
import { AlertDiamondIcon,AlertCircleIcon,CheckCircleIcon,ClockIcon } from "@shopify/polaris-icons";

function MOBPayment({togglestateopen,processstateflag,currentstatus,onBalPaymentProceed,onRCPaymentProceed,baL_value,baL_chargeID,baL_chargestatus,baL_allowtrigger,rC_value,rC_chargeID,rC_chargestatus,rC_allowtrigger,customstoreURL}) {

  const [open, setOpen] = useState(togglestateopen);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const [currentstatusflag, setCurrentstatus] = useState(currentstatus);

  const [param_baL_value, setbaL_value] = useState(baL_value);
  const [param_baL_chargeID, setbaL_chargeID] = useState(baL_chargeID);
  const [param_baL_chargestatus, setbaL_chargestatus] = useState(baL_chargestatus);
  const [param_baL_allowtrigger, setbaL_allowtrigger] = useState(baL_allowtrigger);
  const [param_rC_value, setrC_value] = useState(rC_value);
  const [param_rC_chargeID, setrC_chargeID] = useState(rC_chargeID);
  const [param_rC_chargestatus, setrC_chargestatus] = useState(rC_chargestatus);
  const [param_rC_allowtrigger, setrC_allowtrigger] = useState(rC_allowtrigger);
  const [param_customstoreURL, setcustomstoreURL] = useState(customstoreURL);

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

  const handleBalPaymentClick = () => {
    
    onBalPaymentProceed();
  
  };

  const handleRCPaymentClick = () => {
    
    onRCPaymentProceed();
  
  };

  return (
    <Card>

      <BlockStack>
        <BlockStack inlineAlign="start">
          <InlineStack gap="400">
            {getIcon()}
            <Text as="h3" variant="headingSm">
            Activate your 3D XR Store Subscription 
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
              <Text as="p" variant="bodyMd">
              Your custom 3D XR Store is ready. Please review your Live 3D XR Store on this link <Link url={`https://${param_customstoreURL}`}  target="_blank">{param_customstoreURL}</Link>. A Customer Service Representative will contact you shortly in regards to the space and to collect feedback (If any) regarding your virtual store.
              </Text>
              <br />

              {param_baL_allowtrigger && (
              <>
                <Text as="p" variant="bodyMd">
                Reccuring charges for the space going live will begin once the store has been approved. Furthermore, the remaining 50% of the one time fee for building your custom store will be collected at this time.
                Please proceed to Pending Charge Approval to approve your pending charges.
                </Text>
                              
                <InlineStack align="end">
                    <Button variant="primary" onClick={handleBalPaymentClick}>Proceed to Pending Charge Approval</Button>
                </InlineStack>
              </>
              )}



              {param_rC_allowtrigger && (
              <>
             
                <Text as="p" variant="bodyMd">
                Activate <strong>${param_rC_value} USD </strong> monthly subscription charges.
                </Text>
                              
                <InlineStack align="end">
                    <Button variant="primary" onClick={handleRCPaymentClick}>Proceed to Recurring Charge Approval</Button>
                </InlineStack>
              
              </>
              )}

            </BlockStack>
        </Collapsible>


      </BlockStack>



    </Card>
  )


}


export default MOBPayment;