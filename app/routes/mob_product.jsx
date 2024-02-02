import {
  TextField,
  IndexTable,
  Card,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  BlockStack,
  Button,
  Collapsible,
  useBreakpoints,
  Icon,
  InlineStack,
  Scrollable,
} from "@shopify/polaris"
import React, { useState,useEffect, useCallback } from "react";
import { AlertDiamondIcon,AlertCircleIcon,CheckCircleIcon,ClockIcon } from "@shopify/polaris-icons";

function MOBProduct({productlisting,togglestateopen,processstateflag, onProceed}) {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const [itemStrings, setItemStrings] = useState([])
  const [open, setOpen] = useState(togglestateopen);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  // Use useEffect to react to changes in togglestateopen
  useEffect(() => {
    setOpen(togglestateopen);
  }, [togglestateopen]);



  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : []
  }))
  const [selected, setSelected] = useState(0)
  const onCreateNewView = async value => {
    await sleep(500)
    setItemStrings([...itemStrings, value])
    setSelected(itemStrings.length)
    return true
  }

  const { mode, setMode } = useSetIndexFiltersMode()
  const onHandleCancel = () => {
      setQueryValue("");
  }


  const [accountStatus, setAccountStatus] = useState(undefined)
  const [moneySpent, setMoneySpent] = useState(undefined)
  const [taggedWith, setTaggedWith] = useState("")
  const [queryValue, setQueryValue] = useState("")

 
  const handleFiltersQueryChange = useCallback(
    value => setQueryValue(value),
    []
  )
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    []
  )
  const handleMoneySpentRemove = useCallback(() => setMoneySpent(undefined), [])
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), [])

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), [])
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove()
    handleMoneySpentRemove()
    handleTaggedWithRemove()
    handleQueryValueRemove()
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove
  ])

  const filters = []
  const appliedFilters = []
  
  
  const orders = productlisting.data.map((product,index) => ({
      id: product.product_id,
      productid:product.product_id,
      title: product.title,
      vendor: product.vendor,
    }));
  

  


  const resourceName = {
    singular: "product",
    plural: "products"
  }



  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange
  } = useIndexResourceState(orders)

  const getSelectedItems = () => {
      return orders.filter(order => selectedResources.includes(order.id));
  };
  

  /************************Paging********************************* */

  const [page, setPage] = useState(1);
  const itemsPerPage = 7; // Adjust as needed

  const filteredOrders = queryValue
  ? orders.filter(order =>
      order.title.toLowerCase().includes(queryValue.toLowerCase())
    )
  : orders;


  // Logic to calculate if there are next and previous pages
  const hasNext = page * itemsPerPage < filteredOrders.length;
  const hasPrevious = page > 1;

  // Logic to get the current page's items
  const currentPageOrders = filteredOrders.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
  );

  // Update rowMarkup to use currentPageOrders
  const rowMarkup = currentPageOrders.map(
      (
        { id, productid, title, vendor },
        index
      ) => (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>{productid}</IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {title}
            </Text>
          </IndexTable.Cell>

          <IndexTable.Cell>{vendor}</IndexTable.Cell>
          {/* <IndexTable.Cell>
            <Text as="span" alignment="end" numeric>
              {total}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
          <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell> */}
        </IndexTable.Row>
      )
    )



  // Handlers for pagination
  const handleNext = () => {
  if (hasNext) {
      setPage(page + 1);
  }
  };

  const handlePrevious = () => {
  if (hasPrevious) {
      setPage(page - 1);
  }
  };

  /*************************************************** */
  const handleClick = () => {

      const dataToSend = getSelectedItems().map(item => ({
          productid: item.productid,
          title: item.title,
        }));

      if (dataToSend.length>0)  {onProceed(dataToSend);}
      
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
      Publish your Products to the 3D XR Store
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
      <InlineStack>

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
      Select your products that you would like to 3D enable and publish in
      the 3D XR Store.
      </Text>
      
      <Text as="p" variant="bodyMd">
        Click the checkbox in the Product ID header to <strong>select all</strong> products.
      </Text>

      <Card>
      <IndexFilters
      //   sortOptions={sortOptions}
      //   sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Search Products"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => setQueryValue("")}
      //   onSort={setSortSelected}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView
        onCreateNewView={onCreateNewView}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Product ID" },
          { title: "Title" },
          { title: "Vendor", alignment: "end" },
        ]}
        pagination={{
          hasNext,
          hasPrevious,
          onNext: handleNext,
          onPrevious: handlePrevious,
        }}
      >
        {rowMarkup}
      </IndexTable>
      </Card>

      <InlineStack align="end">
          <Button variant="primary" onClick={handleClick}>Proceed</Button>
      </InlineStack>

  </BlockStack>

  </Collapsible>
  </BlockStack>
  </Card>



  )


  // function isEmpty(value) {
  //   if (Array.isArray(value)) {
  //     return value.length === 0
  //   } else {
  //     return value === "" || value == null
  //   }
  // }
  
}

export default MOBProduct;