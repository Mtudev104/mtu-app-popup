import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import {
  Box,
  Button,
  Card,
  InlineStack,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <Page>
      <Box maxWidth="560px" paddingBlockStart="600">
        <Card>
          <Box padding="500">
            <Form method="post">
              <InlineStack align="space-between">
                <Text as="h1" variant="headingLg">
                  Log in
                </Text>
              </InlineStack>
              <Box paddingBlockStart="300" paddingBlockEnd="200">
                <TextField
                  name="shop"
                  label="Shop domain"
                  placeholder="example.myshopify.com"
                  autoComplete="on"
                  value={shop}
                  onChange={setShop}
                  error={errors.shop}
                />
              </Box>
              <Button variant="primary" submit>
                Log in
              </Button>
            </Form>
          </Box>
        </Card>
      </Box>
    </Page>
  );
}
