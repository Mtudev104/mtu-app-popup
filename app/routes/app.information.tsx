import {
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import styles from "./styles/information.module.css";

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

  return (
    <s-page heading="Shop Management">
      <s-section>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.titleWrap}>
                <p className={styles.title}>Store information</p>
                <p className={styles.subtitle}>
                  Quickly view the key information Shopify is providing for your
                  app.
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <div className={styles.label}>Shop name</div>
                <div className={styles.value}>{safe(shop?.name)}</div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Shop owner</div>
                <div className={styles.value}>{safe(shop?.shopOwnerName)}</div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Email</div>
                <div className={styles.value}>{safe(shop?.email)}</div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Domain</div>
                <div className={styles.value}>
                  {domainUrl ? (
                    <a className={styles.link} href={domainUrl} target="_blank">
                      {domainUrl}
                    </a>
                  ) : (
                    <span className={styles.valueMuted}>—</span>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>National</div>
                <div className={styles.value}>
                  {safe(shop?.billingAddress?.country)}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Phone number</div>
                <div className={styles.value}>
                  {safe(shop?.billingAddress?.phone)}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Plan</div>
                <div className={styles.value}>{safe(planName)}</div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Partner development</div>
                <div className={styles.value}>
                  {isPartnerDev ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </s-section>
      <s-section slot="aside" heading="Resources">
        <s-unordered-list>
          <s-list-item>
            <s-link
              href="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
              target="_blank"
            >
              App nav best practices
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
