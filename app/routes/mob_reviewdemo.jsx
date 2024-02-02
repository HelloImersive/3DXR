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

function MOBReviewDemo({togglestateopen,processstateflag,currentstatus,onProceed,demostoreURL}) {

  const [open, setOpen] = useState(togglestateopen);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const [checked, setChecked] = useState(false);
  const [currentstatusflag, setCurrentstatus] = useState(currentstatus);
  const [paramdemostoreURL, setdemostoreURL] = useState(demostoreURL);
  const handleChange = useCallback(
    (newChecked) => setChecked(newChecked),
    [],
  );

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

  
  const handleClick = () => {
    
      onProceed();
    
  };

  return (
    <Card>

      <BlockStack>
        <BlockStack inlineAlign="start">
          <InlineStack gap="400">
            {getIcon()}
            <Text as="h3" variant="headingSm">
              Review your 3D XR <i>Demo</i> Store
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

              {currentstatusflag==="DEMO_STORE_WIP" && (
                <Text as="p" variant="bodyMd">
                    Your Free 3D XR demo store is under construction. You will receive an email from Imersive once it is ready. Please check this page for status updates.
                </Text>
              )}

          
            {currentstatusflag==="DEMO_STORE_READY_REVIEW_PENDING" && (
             <>
            
              <Text as="h1" variant="headingLg" alignment="center" tone="success" >
              The Free 3D XR Demo Store is Ready!
              </Text>
              <Text as="p" variant="bodyMd">
              Your Free 3D XR Demo Store is ready. This is a sample demonstrating a typical 3D XR experience.    Review the demo store here (<Link url={`https://${paramdemostoreURL}`}  target="_blank">{paramdemostoreURL}</Link>). This link will be valid for <strong>7 days</strong> for you to complete your review.
              </Text>
              <Text as="p" variant="bodyMd">
              Please continue to the next step to build your own custom 3d XR virtual store. By clicking the button below, you are confirming you have reviewed the Free demo store.
              </Text>
                <Checkbox
                  label="I have reviewed the free 3D XR demo store."
                  checked={checked}
                  onChange={handleChange}
                />
  
              {checked && (
                <>
                <Text as="p" variant="bodyMd">
                Imersive aims to build the perfect 3D virtual store that represents your brand to its fullest potential. To further customize the store, products, and online shopping experience please click <strong>Build my Custom 3D XR Store</strong> button below.
                </Text>


                <InlineStack align="end">
                    <Button variant="primary" onClick={handleClick}  >Build my Custom 3D XR Store</Button>
                </InlineStack>
                </>
              )}

              </>
            )}  

            </BlockStack>
        </Collapsible>


      </BlockStack>



    </Card>
  )


}


export default MOBReviewDemo;