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
  Box,
} from "@shopify/polaris"
import { AlertDiamondIcon,AlertCircleIcon,CheckCircleIcon,ClockIcon } from "@shopify/polaris-icons";

function MOBRoomInputs({togglestateopen,processstateflag,ratepersqft,onProceed}) {
  const defRate = ratepersqft;

  const [open, setOpen] = useState(togglestateopen);

  const [selectedRooms, setSelectedRooms] = useState([])
  const [rooms, setRooms] = useState([  {
    id: "1",
    rate: defRate,
    name: "Room 1 (Mandatory default)",
    size: 1000,
    amount:(defRate*1000),
    remarks:""
  }]);

  const resourceName = {
    singular: "room",
    plural: "rooms"
  }


  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  // Use useEffect to react to changes in togglestateopen
  useEffect(() => {
    setOpen(togglestateopen);
  }, [togglestateopen]);


  const [popoverActive, setPopoverActive] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomSize, setRoomSize] = useState(0); // Assuming size is a number
  //const [roomdata, setRoomdata] = useState([{id:"1",name:"#Room A",size:1000}]);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleTagValueChange = useCallback(
    (value) => setTagValue(value),
    [],
  );


  const handleRoomNameChange = (value) => setRoomName(value);
  const handleRoomSizeChange = (value) => setRoomSize(value);

  // const handleRoomSizeChange = (newValue) => {
  //   // Round the entered value to the nearest multiple of 100
  //   const roundedValue = Math.round(newValue / 500) * 500;
  //   setRoomSize(roundedValue);
  // };

  const handleAddRoom = () => {
    const nextId = rooms.length === 0 ? 1 : Math.max(...rooms.map(room => room.id)) + 1;
    // console.log('nextid:' + nextId )

    const newRoom = {
      id: nextId.toString(), 
      rate: defRate,
      name: roomName, 
      size: parseInt(roomSize, 10) ,
      amount:(defRate*parseInt(roomSize, 10)),
      remarks:""
    };

    setRooms([...rooms, newRoom]);
    setRoomName('');
    setRoomSize(0);
    setPopoverActive(false);
  };

  const activator = (
    <Button onClick={togglePopoverActive}>
      Add Room
    </Button>
  );




  const promotedBulkActions = [
    {
      content: "Delete selected",
      onAction: () => {
        // const newRoomData = rooms.filter(room => !selectedRooms.includes(room.id.toString()));
        const newRoomData = rooms.filter((room, index) => index === 0 || !selectedRooms.includes(room.id.toString()));
        setRooms(newRoomData);
      }
    }
  ]



  const rows = rooms.map(({ name,  size, rate, amount }) => [
    name,
    size.toString()+" sq.ft.",
    rate.toString(),
    amount.toString()
  ]);

  const headers = [
    '#',
    'Area',
    'Price',
    'Cost'
  ];

  const contenttypes = [
    "text",
    "numeric",
    "numeric",
    "numeric"
  ];

  //const totals=["",     "",    "",     "$155,830.00"];
  const [totals, setTotals] = useState(["", "", "", ""]);
  // const [taxtotal, setTaxtotal] = useState(0);
  // const [grandtotal, setGrandtotal] = useState(0);
  // const formattedTaxTotal = new Intl.NumberFormat('en-US', {
  //   style: 'currency',
  //   currency: 'USD',
  // }).format(taxtotal);

  // const formattedgrandTotal = new Intl.NumberFormat('en-US', {
  //   style: 'currency',
  //   currency: 'USD',
  // }).format(grandtotal);



  // const calculateTotals = () => {
  //   let subTotal = 0;

  //   const updatedRooms = rooms.map(room => {
  //     const amount = room.rate * room.size;
  //     subTotal += amount;
  //     return { ...room, amount };
  //   });

  //   setRooms(updatedRooms); // Update the rooms state with the new amounts
  //   return subTotal; // Return the grand total
  // };


  const calculateTotals = (rooms) => {
    return rooms.reduce((subTotal, room) => {
      const amount = room.rate * room.size;
      return subTotal + amount;
    }, 0);
  };
  

  useEffect(() => {
    const totalAmount = calculateTotals(rooms);
    setTotals(["", "", "", `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(totalAmount)}`]);

    // const _taxtotal = (totalAmount * Taxpercent /100)
    // setTaxtotal(_taxtotal)

    // const _grandtotal = (totalAmount +_taxtotal )
    // setGrandtotal(_grandtotal)
   
  }, [rooms]); // This will recalculate whenever rooms data changes


  const [textFieldValue, setTextFieldValue] = useState('');
  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    [],
  );


  const handleClick = () => {
    rooms[0].remarks = textFieldValue;
    if (rooms.length>0)  {onProceed(rooms);}

  };


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

  return (
    <Card>

      <BlockStack>
        <BlockStack inlineAlign="start">
          <InlineStack gap="400">
            {getIcon()}
            <Text as="h3" variant="headingSm">
              Configure your 3D XR Virtual Store
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
           <BlockStack gap="500">
              <br />
              <Text as="p" variant="bodyMd">
                  Let us get to know the high level requirements for your custom 3D XR
                  Virtual Store. A typical 3D XR Store would consist of one or more
                  product display /brand awarness /marketing areas. Please provide
                  inputs for your 3D Store
              </Text>


              <Popover
                  preferredPosition="below"
                  preferredAlignment="left"
                  active={popoverActive}
                  activator={activator}
                  onClose={togglePopoverActive}
                  ariaHaspopup={false}
                  sectioned

              >
                  <FormLayout>
                  <TextField
                      label="Name"
                      value={roomName}
                      onChange={handleRoomNameChange}
                      autoComplete="off"
                  />
                  
                  <TextField
                      label="Size (sq.ft.)"
                      type="number"
                      value={roomSize.toString()}
                      onChange={handleRoomSizeChange}
                      autoComplete="off"
                  />
                  
                
                  <Button onClick={handleAddRoom} size="slim">Add Room</Button>
                  </FormLayout>
              </Popover>
              {/* <ul>
                  {roomdata.map((room, index) => (
                  <li key={index}>{room.name} - {room.size}</li>
                  ))}
              </ul> */}

              <Layout>
                      <Layout.Section variant="oneThird">

                      <Card>
                          <Text
                            as="h2"
                            variant="bodyMd"
                            fontWeight="medium"
                            alignment="left"
                            >
                            3D Room Configuration   </Text>
                          <ResourceList
                          resourceName={resourceName}
                          items={rooms}
                          renderItem={renderItem}
                          selectedItems={selectedRooms}
                          onSelectionChange={setSelectedRooms}
                          promotedBulkActions={promotedBulkActions}
                        />
                        </Card>
                      </Layout.Section>

                      <Layout.Section>
                        <Card>
                              <Text
                              as="h2"
                              variant="bodyMd"
                              fontWeight="medium"
                              alignment="left"
                              >
                              Estimated Cost (USD)
                          </Text>
                                
                          <DataTable
                            showTotalsInFooter
                            columnContentTypes={contenttypes}
                            headings={headers}
                            rows={rows}
                            totals={totals}
                            totalsName={{
                              singular: "Total Estimated cost",
                              plural: "Total Estimated cost"
                            }}
                          />

                        {/* <Box   padding="400" borderWidth="0" borderColor="border" >
                            <BlockStack gap="200">
                                <InlineStack  gap="1000" align="end">
                                  <Text>Tax {Taxpercent} %</Text>
                                  <Text>{formattedTaxTotal}</Text>
                                </InlineStack>
                                <InlineStack  gap="1000" align="end">
                                  <Text  as="h3" variant="headingSm" fontWeight="medium">Total Estimated cost (USD)</Text>
                                  <Text  as="h3" variant="headingSm" fontWeight="medium">{formattedgrandTotal}</Text>
                                </InlineStack>
                            </BlockStack>
                        </Box> */}
             


                          </Card>
                      </Layout.Section>
                  
              </Layout>


              <TextField
                label="Please describe how your ideal store would look. Please mention the ideal function of these rooms, the architectural style, the number of preferred spaces, and anything else that may be of help for our team to custom-build your store."
                value={textFieldValue}
                onChange={handleTextFieldChange}
                maxLength={1000}
                autoComplete="off"
                showCharacterCount
                multiline
              />

              <Text as="p" variant="bodyMd">
                Once you click <strong>Build 3D XR Demo Store</strong> button below, Imersive shall select one (1) product from your product list and place it in a demo store. You can review the demo store and functionality and approve the charges for creating the 3D assets for all your {rooms.length} selected products and the custom space you have requested. We will build your custom 3D XR Store only after you approve the charges from your Shopify admin panel.
              </Text>
              <InlineStack align="end">
                  <Button variant="primary" onClick={handleClick} >Build my free 3D XR Demo Store</Button>
              </InlineStack>



              </BlockStack>
        </Collapsible>


      </BlockStack>



    </Card>
  )

  function renderItem(room) {
    const { id, rate, name, size,amount } = room
    const media = <Avatar customer size="md" name={name} />

    return (

      
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${name}`}
      >
        
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {name}
        </Text>
        <div>{size.toString()} sq.ft. </div>


      </ResourceItem>



    )
  }
}


export default MOBRoomInputs;