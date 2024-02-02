
import React, { useState,useEffect, useCallback } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Box,
  Card,
  TextField,
  Link,
  Listbox,
  AutoSelection,
  Text,
  BlockStack,
  Button,
  Collapsible,
  Icon,
  InlineStack,
  Scrollable,
  EmptySearchResult,
} from "@shopify/polaris";
import { SearchIcon,CheckCircleIcon } from "@shopify/polaris-icons";
import {authenticate } from "../shopify.server";

const actionValue = '__ACTION__';
const segments = [
  {
    label: 'All customers',
    id: 'gid://shopify/CustomerSegment/1',
    value: '0',
  }
];

// const lazyLoadSegments = Array.from(Array(100)).map((_, index) => ({
//   label: `Other customers ${index + 13}`,
//   id: `gid://shopify/CustomerSegment/${index + 13}`,
//   value: `${index + 12}`,
// }));

// segments.push(...lazyLoadSegments);

const interval = 25;





function MOBProductSingle({productlisting,onProceed}) {
  const [open, setOpen] = useState(true);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
 

  const segments = productlisting.data.map((product,index) => ({
    label: product.title,
    id: product.product_id,
    value: index,
  }));


  const [showFooterAction, setShowFooterAction] = useState(true);
  const [query, setQuery] = useState('');
  const [lazyLoading, setLazyLoading] = useState(false);
  const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
  const [visibleOptionIndex, setVisibleOptionIndex] = useState(6);
  const [activeOptionId, setActiveOptionId] = useState(segments[0].id);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [filteredSegments, setFilteredSegments] =  useState([]);


  const handleClickShowAll = () => {
    setShowFooterAction(false);
    setVisibleOptionIndex(segments.length);
  };

  const handleFilterSegments = (query) => {
    const nextFilteredSegments = segments.filter((segment) => {
      return segment.label
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase().trim());
    });

    setFilteredSegments(nextFilteredSegments);
  };

  const handleQueryChange = (query) => {
    setQuery(query);

    if (query.length >= 2) handleFilterSegments(query);
  };

  const handleQueryClear = () => {
    handleQueryChange('');
  };

  const handleSegmentSelect = (segmentIndex) => {
    if (segmentIndex === actionValue) {
      return handleClickShowAll();
    }

    setSelectedSegmentIndex(Number(segmentIndex));
  };

  const handleActiveOptionChange = (_, domId) => {
    setActiveOptionId(domId);
  };


  // const handleLazyLoadSegments = () => {
  //   if (willLoadMoreResults && !showFooterAction) {
  //     setLazyLoading(true);

  //     const options = query ? filteredSegments : segments;

  //     setTimeout(() => {
  //       const remainingOptionCount = options.length - visibleOptionIndex;
  //       const nextVisibleOptionIndex =
  //         remainingOptionCount >= interval
  //           ? visibleOptionIndex + interval
  //           : visibleOptionIndex + remainingOptionCount;

  //       setLazyLoading(false);
  //       setVisibleOptionIndex(nextVisibleOptionIndex);

  //       if (remainingOptionCount <= interval) {
  //         setWillLoadMoreResults(false);
  //       }
  //     }, 1000);
  //   }
  // };

  const listboxId = 'SearchableListbox';

  const textFieldMarkup = (
    <div style={{padding: '12px'}}>
      <TextField
        focused={showFooterAction}
        clearButton
        labelHidden
        label="Products"
        placeholder="Search products"
        autoComplete="off"
        value={query}
        prefix={<Icon source={SearchIcon} />}
        ariaActiveDescendant={activeOptionId}
        ariaControls={listboxId}
        onChange={handleQueryChange}
        onClearButtonClick={handleQueryClear}
      />
    </div>
  );

  const segmentOptions = query ? filteredSegments : segments;

  const segmentList =
    segmentOptions.length > 0
      ? segmentOptions
          .slice(0, visibleOptionIndex)
          .map(({label, id, value}) => {
            const selected = segments[selectedSegmentIndex].value === value;

            return (
              <Listbox.Option key={id} value={value} selected={selected}>
                <Listbox.TextOption selected={selected}>
                  {label}
                </Listbox.TextOption>
              </Listbox.Option>
            );
          })
      : null;

  const showAllMarkup = showFooterAction ? (
    <Listbox.Action value={actionValue}>
      <span style={{color: 'var(--p-color-text-emphasis)'}}>
        Show all {segments.length} products
      </span>
    </Listbox.Action>
  ) : null;

  const lazyLoadingMarkup = lazyLoading ? (
    <Listbox.Loading
      accessibilityLabel={`${
        query ? 'Filtering' : 'Loading'
      } products`}
    />
  ) : null;

  const noResultsMarkup =
    segmentOptions.length === 0 ? (
      <EmptySearchResult
        title=""
        description={`No products found matching "${query}"`}
      />
    ) : null;

  const listboxMarkup = (
    <Listbox
      enableKeyboardControl
      autoSelection={AutoSelection.FirstSelected}
      accessibilityLabel="Search for and select a product"
      customListId={listboxId}
      onSelect={handleSegmentSelect}
      onActiveOptionChange={handleActiveOptionChange}
    >
      {segmentList}
      {showAllMarkup}
      {noResultsMarkup}
      {lazyLoadingMarkup}
    </Listbox>
  );


  const handleClick = () => {
    const dataToSend = [{ Productid: 64648449846 }];
    onProceed(dataToSend);
  };


  return (
    <Card>
      <BlockStack>
        <BlockStack inlineAlign="start">
          <InlineStack gap="400">
            <Icon source={CheckCircleIcon} tone="success" />
            <Text as="h3" variant="headingSm">
            Publish your Product to the 3D Store
            </Text>
            <Button
              variant="plain"
              onClick={handleToggle}
              ariaExpanded={open}
              ariaControls="basic-collapsible"
              
            >
              Toggle
            </Button>
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
          <div
            style={{
              alignItems: 'stretch',
              borderTop: '1px solid #DFE3E8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'stretch',
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {textFieldMarkup}

            <Scrollable
              shadow
              style={{
                position: 'relative',
                height: '292px',
                padding: 'var(--p-space-200) 0',
                borderBottomLeftRadius: 'var(--p-border-radius-200)',
                borderBottomRightRadius: 'var(--p-border-radius-200)',
              }}
              //onScrolledToBottom={handleLazyLoadSegments}
            >
              {listboxMarkup}
            </Scrollable>
          </div>
          <InlineStack align="end">
              <Button variant="primary" onClick={handleClick}>Proceed</Button>
          </InlineStack>

        </BlockStack>

        </Collapsible>
      </BlockStack>
    </Card>
  );
}

export default MOBProductSingle;
