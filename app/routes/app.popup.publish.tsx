import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const popup = await prisma.popup.findUnique({
    where: { shop: session.shop },
  });
  if (!popup) return { error: "Popup not found" };

  // Lấy shop ID thật từ Shopify
  const shopRes = await admin.graphql(`query { shop { id } }`);
  const shopJson = await shopRes.json();
  const shopId = shopJson.data.shop.id;

  // Đẩy config lên metafield
  const response = await admin.graphql(
    `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key value }
        userErrors { field message }
      }
    }
  `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "mtu_popup",
            key: "config",
            type: "json",
            value: JSON.stringify({
              isActive: popup.isActive,

              // Content
              title: popup.title,
              description: popup.description,
              btnText: popup.btnText,
              btnLink: popup.btnLink,

              // Design
              bgColor: popup.bgColor,
              textColor: popup.textColor,
              btnColor: popup.btnColor,
              image: popup.image,

              // General
              position: popup.position,

              // Display (NEW)
              triggerType: popup.triggerType,
              triggerValue: popup.triggerValue,
              repeatType: popup.repeatType,
              displayScope: popup.displayScope,
              matchType: popup.matchType,
              conditions: popup.conditions,

              showClose: popup.showClose,
            }),
          },
        ],
      },
    },
  );

  const resJson = await response.json();
  const errors = resJson.data?.metafieldsSet?.userErrors;
  if (errors?.length > 0) return { error: errors[0].message };

  await prisma.popup.update({
    where: { shop: session.shop },
    data: { isPublished: true },
  });

  return { success: true };
};
