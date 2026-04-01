import {
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  Box,
  Card,
  BlockStack,
  InlineGrid,
  Text,
  Link,
  Divider,
  Page,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  const popup = await prisma.popup.findUnique({
    where: { shop: session.shop },
  });

  const response = await admin.graphql(`
    query {
      shop {
        name
        email
        shopOwnerName
        primaryDomain {
          url
        }
        billingAddress {
          country
          phone
        }
        plan {
          displayName
          partnerDevelopment
        }
      }
    }
  `);

  const data = await response.json();

  return {
    popup,
    shop: data.data.shop,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function InformationPage() {
  const { shop } = useLoaderData<typeof loader>();

  const safe = (v?: string | null) => (v && v.trim().length ? v : "—");
  const domainUrl = shop?.primaryDomain?.url as string | undefined;
  const planName = shop?.plan?.displayName as string | undefined;
  const isPartnerDev = Boolean(shop?.plan?.partnerDevelopment);

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Shop name", value: safe(shop?.name) },
    { label: "Shop owner", value: safe(shop?.shopOwnerName) },
    { label: "Email", value: safe(shop?.email) },
    {
      label: "Domain",
      value: domainUrl ? (
        <Link url={domainUrl} target="_blank">
          {domainUrl}
        </Link>
      ) : (
        "—"
      ),
    },
    { label: "Country", value: safe(shop?.billingAddress?.country) },
    { label: "Phone number", value: safe(shop?.billingAddress?.phone) },
    { label: "Plan", value: safe(planName) },
    { label: "Partner development", value: isPartnerDev ? "Yes" : "No" },
  ];

  return (
    <Page title="Shop Management">
      <Box paddingBlockStart="300">
        <Card>
          <BlockStack gap="300">
            {/* Header */}
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Store information
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Quickly view the key information Shopify is providing for your
                app.
              </Text>
            </BlockStack>

            <Divider />

            {/* Grid fields */}
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
              {fields.map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#f6f6f7",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <Text
                    as="span"
                    variant="bodySm"
                    fontWeight="semibold"
                    tone="subdued"
                  >
                    {label.toUpperCase()}
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {value}
                  </Text>
                </div>
              ))}
            </InlineGrid>
          </BlockStack>
        </Card>
      </Box>
    </Page>
  );
}
