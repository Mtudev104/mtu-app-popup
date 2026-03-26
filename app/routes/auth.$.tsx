import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  //await authenticate.admin(request);
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const existingPopup = await prisma.popup.findUnique({ where: { shop } });
  if (!existingPopup) {
    await prisma.popup.create({
      data: {
        shop,
        title: "",
        description: "",
        btnText: "",
        btnLink: "",
      },
    });
  }

  return null;
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
