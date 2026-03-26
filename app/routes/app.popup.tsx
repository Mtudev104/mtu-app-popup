import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const popup = await prisma.popup.findUnique({
    where: { shop: session.shop },
  });

  const response = await admin.graphql(`
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      files(first: 10) {
        edges {
          node {
            ... on MediaImage {
              id
              image {
                url
              }
            }
          }
        }
      }
    }
  `);

  const data = await response.json();

  return {
    popup,
    products: data.data.products.edges,
    collections: data.data.collections.edges,
    images: data.data.files.edges,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const body = await request.json();

  const popup = await prisma.popup.upsert({
    where: { shop: session.shop },
    update: body,
    create: { shop: session.shop, ...body },
  });

  return { popup };
};
