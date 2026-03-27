import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import {
  Box,
  Button,
  Card,
  List,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Box maxWidth="560px" paddingBlockStart="800" paddingInlineStart="400">
        <Card>
          <Box padding="500">
            <Text as="h1" variant="headingLg">
              Popup Sales Boost
            </Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodyMd" tone="subdued">
                Build and publish storefront popups directly from Shopify admin.
              </Text>
            </Box>
            {showForm ? (
              <Box paddingBlockStart="400">
                <Form method="post" action="/auth/login">
                  <Box paddingBlockEnd="200">
                    <TextField
                      autoComplete="off"
                      label="Shop domain"
                      name="shop"
                      placeholder="my-shop-domain.myshopify.com"
                    />
                  </Box>
                  <Button variant="primary" submit>
                    Log in
                  </Button>
                </Form>
              </Box>
            ) : null}
            <Box paddingBlockStart="400">
              <List type="bullet">
                <List.Item>
                  Customize popup content and display behavior.
                </List.Item>
                <List.Item>Preview in real-time before publishing.</List.Item>
                <List.Item>Save settings per shop automatically.</List.Item>
              </List>
            </Box>
          </Box>
        </Card>
      </Box>
    </Page>
  );
}
