import { useEffect, useState, useCallback } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Checkbox,
  Button,
  InlineGrid,
  Layout,
  Divider,
  Box,
  Page,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const popup = await prisma.popup.findUnique({
    where: { shop: session.shop },
  });
  return { popup };
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

type Tab = "general" | "content" | "design" | "display";
const TABS: Tab[] = ["general", "content", "design", "display"];
const POSITIONS = ["center", "bottom-left", "bottom-right"] as const;
const ANIMATIONS = ["fade", "slide"] as const;

const DEFAULT_POPUP = {
  name: "My Popup",
  isActive: false,
  delay: 3,
  title: "Don't want to miss anything?",
  description:
    "Be the first to see new arrivals, exclusive deals and much more.",
  btnText: "Explore And Shop Now!",
  btnLink: "",
  bgColor: "#ffffff",
  textColor: "#000000",
  btnColor: "#000000",
  image:
    "https://lavenderstudio.com.vn/wp-content/uploads/2017/03/chup-lookbook-dep-sg.jpg",
  position: "center",
  animation: "fade",
  showClose: true,
};

export default function Index() {
  const { popup: initialPopup } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const publishFetcher = useFetcher();
  const shopify = useAppBridge();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [imageUploading, setImageUploading] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);

  const [form, setForm] = useState({
    name: initialPopup?.name || DEFAULT_POPUP.name,
    isActive: initialPopup?.isActive ?? DEFAULT_POPUP.isActive,
    delay: initialPopup?.delay ?? DEFAULT_POPUP.delay,
    title: initialPopup?.title || DEFAULT_POPUP.title,
    description: initialPopup?.description || DEFAULT_POPUP.description,
    btnText: initialPopup?.btnText || DEFAULT_POPUP.btnText,
    btnLink: initialPopup?.btnLink || DEFAULT_POPUP.btnLink,
    bgColor: initialPopup?.bgColor || DEFAULT_POPUP.bgColor,
    textColor: initialPopup?.textColor || DEFAULT_POPUP.textColor,
    btnColor: initialPopup?.btnColor || DEFAULT_POPUP.btnColor,
    image: initialPopup?.image || DEFAULT_POPUP.image,
    position: initialPopup?.position || DEFAULT_POPUP.position,
    animation: initialPopup?.animation || DEFAULT_POPUP.animation,
    showClose: initialPopup?.showClose ?? DEFAULT_POPUP.showClose,
  });

  const isSaving = fetcher.state !== "idle";
  const isPublishing = publishFetcher.state !== "idle";
  const isDisabled = imageUploading || isSaving || isPublishing;

  useEffect(() => {
    if (fetcher.data?.popup && pendingPublish) {
      setPendingPublish(false);
      publishFetcher.submit(
        {},
        {
          method: "POST",
          action: "/app/popup/publish",
          encType: "application/json",
        },
      );
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (publishFetcher.data?.success) shopify.toast.show("Pop-up updated");
    if (publishFetcher.data?.error)
      shopify.toast.show(publishFetcher.data.error, { isError: true });
  }, [publishFetcher.data]);

  const update = useCallback((key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: preview }));
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/app/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImageUploading(false);
    if (data.url) setForm((prev) => ({ ...prev, image: data.url }));
    else shopify.toast.show(data.error || "Upload failed", { isError: true });
  };

  const handlePublish = () => {
    setPendingPublish(true);
    fetcher.submit(form, { method: "POST", encType: "application/json" });
  };

  return (
    <>
      <style>{`@keyframes mtu-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {/* <s-button
          slot="primary-action"
          onClick={handlePublish}
          {...(isPublishing ? { loading: true } : {})}
          {...(isDisabled ? { disabled: true } : {})}
        >
          Publish
        </s-button> */}

        {/* Layout 2 cột */}
        <div style={{ padding: 16, maxWidth: "82rem" }}>
          <Layout>
            <Layout.Section variant="oneThird">
              {/* CỘT TRÁI — Editor */}
              <Card padding="0">
                {/* Tabs */}
                <div style={{ borderBottom: "1px solid #e1e3e5" }}>
                  <InlineStack gap="0">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "12px 18px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          borderBottom:
                            activeTab === tab
                              ? "2px solid #008060"
                              : "2px solid transparent",
                          color: activeTab === tab ? "#008060" : "#6d7175",
                          fontWeight: activeTab === tab ? 600 : 400,
                          fontSize: 14,
                          textTransform: "capitalize",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </InlineStack>
                </div>

                <Box padding="400">
                  {/* Tab: General */}
                  {activeTab === "general" && (
                    <BlockStack gap="400">
                      <TextField
                        label="Popup name"
                        value={form.name}
                        onChange={(v) => update("name", v)}
                        helpText="Internal name, not shown to customers"
                        autoComplete="off"
                      />
                      <Checkbox
                        label="Active popup"
                        checked={form.isActive}
                        onChange={(v) => update("isActive", v)}
                      />
                      <TextField
                        label="Delay (seconds)"
                        type="number"
                        value={String(form.delay)}
                        onChange={(v) => update("delay", Number(v))}
                        helpText="How long to wait before showing the popup"
                        autoComplete="off"
                      />
                    </BlockStack>
                  )}

                  {/* Tab: Content */}
                  {activeTab === "content" && (
                    <BlockStack gap="400">
                      <TextField
                        label="Title"
                        value={form.title}
                        onChange={(v) => update("title", v)}
                        autoComplete="off"
                      />
                      <TextField
                        label="Description"
                        value={form.description}
                        onChange={(v) => update("description", v)}
                        multiline={3}
                        autoComplete="off"
                      />
                      <TextField
                        label="Button text"
                        value={form.btnText}
                        onChange={(v) => update("btnText", v)}
                        autoComplete="off"
                      />
                      <TextField
                        label="Button link"
                        value={form.btnLink}
                        onChange={(v) => update("btnLink", v)}
                        placeholder="https://"
                        autoComplete="off"
                      />
                    </BlockStack>
                  )}

                  {/* Tab: Design */}
                  {activeTab === "design" && (
                    <BlockStack gap="400">
                      {/* Color fields */}
                      {[
                        { label: "Background color", key: "bgColor" },
                        { label: "Text color", key: "textColor" },
                        { label: "Button color", key: "btnColor" },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <Text as="p" variant="bodyMd" fontWeight="medium">
                            {label}
                          </Text>
                          <Box paddingBlockStart="100">
                            <InlineStack gap="200" blockAlign="center">
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label=""
                                  labelHidden
                                  value={(form as any)[key]}
                                  onChange={(v) => update(key, v)}
                                  autoComplete="off"
                                />
                              </div>
                              <input
                                type="color"
                                value={(form as any)[key]}
                                onChange={(e) => update(key, e.target.value)}
                                style={{
                                  width: 48,
                                  height: 36,
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  padding: 2,
                                  border: "1px solid #ccc",
                                }}
                              />
                            </InlineStack>
                          </Box>
                        </div>
                      ))}

                      <Divider />

                      {/* Image upload */}
                      <div>
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          Image
                        </Text>
                        <Box paddingBlockStart="200">
                          {form.image && (
                            <div
                              style={{
                                position: "relative",
                                marginBottom: 12,
                              }}
                            >
                              <img
                                src={form.image}
                                alt=""
                                style={{
                                  width: "100%",
                                  maxHeight: 200,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  display: "block",
                                  opacity: imageUploading ? 0.5 : 1,
                                  transition: "opacity 0.3s ease",
                                }}
                              />
                              {imageUploading && (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: 8,
                                    background: "rgba(0,0,0,0.35)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      border: "3px solid rgba(255,255,255,0.3)",
                                      borderTop: "3px solid #fff",
                                      borderRadius: "50%",
                                      animation:
                                        "mtu-spin 0.8s linear infinite",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "0 14px",
                              height: 36,
                              border: "1px solid #ccc",
                              borderRadius: 6,
                              background: "#f6f6f7",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#333",
                              cursor: imageUploading
                                ? "not-allowed"
                                : "pointer",
                              opacity: imageUploading ? 0.6 : 1,
                            }}
                          >
                            {imageUploading ? "Uploading..." : "Choose file"}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={imageUploading}
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                            />
                          </label>
                        </Box>
                      </div>
                    </BlockStack>
                  )}

                  {/* Tab: Display */}
                  {activeTab === "display" && (
                    <BlockStack gap="400">
                      <div>
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          Position
                        </Text>
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200">
                            {POSITIONS.map((pos) => (
                              <Button
                                key={pos}
                                pressed={form.position === pos}
                                onClick={() => update("position", pos)}
                              >
                                {pos}
                              </Button>
                            ))}
                          </InlineStack>
                        </Box>
                      </div>
                      <div>
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          Animation
                        </Text>
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200">
                            {ANIMATIONS.map((anim) => (
                              <Button
                                key={anim}
                                pressed={form.animation === anim}
                                onClick={() => update("animation", anim)}
                              >
                                {anim}
                              </Button>
                            ))}
                          </InlineStack>
                        </Box>
                      </div>
                      <Checkbox
                        label="Show close button"
                        checked={form.showClose}
                        onChange={(v) => update("showClose", v)}
                      />
                    </BlockStack>
                  )}
                </Box>
              </Card>
            </Layout.Section>

            {/* CỘT PHẢI — Preview */}
            <Layout.Section>
              <BlockStack gap="300">
                <Card>
                  <Text as="h2" variant="headingMd">
                    Preview
                  </Text>
                  <Box paddingBlockStart="400">
                    <div
                      style={{
                        background: "#f4f6f8",
                        borderRadius: 8,
                        minHeight: 500,
                        display: "flex",
                        padding: 20,
                        alignItems:
                          form.position === "center" ? "center" : "flex-end",
                        justifyContent:
                          form.position === "bottom-right"
                            ? "flex-end"
                            : form.position === "bottom-left"
                              ? "flex-start"
                              : "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          background: form.bgColor,
                          color: form.textColor,
                          borderRadius: 6,
                          padding: "12px 14px",
                          width: "95%",
                          height: 200,
                          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                          position: "relative",
                        }}
                      >
                        {form.showClose && (
                          <button
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              background: "#fff",
                              padding: "4px 7px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 999,
                              border: "none",
                              boxShadow: "0 4px 24px rgba(0,0,0,0.32)",
                              fontSize: 10,
                              cursor: "pointer",
                              color: form.textColor,
                              zIndex: 1,
                            }}
                          >
                            ✕
                          </button>
                        )}
                        {form.image && (
                          <div style={{ width: "40%", background: "#eee" }}>
                            <img
                              src={form.image}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          </div>
                        )}
                        <div
                          style={{
                            width: "60%",
                            padding: "0 25px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <h3
                            style={{
                              margin: "0 0 8px",
                              fontSize: 18,
                              color: form.textColor,
                            }}
                          >
                            {form.title}
                          </h3>
                          <p
                            style={{
                              margin: "0 0 16px",
                              fontSize: 14,
                              color: form.textColor,
                              opacity: 0.8,
                            }}
                          >
                            {form.description}
                          </p>
                          {form.btnText && (
                            <button
                              style={{
                                background: form.btnColor,
                                color: form.textColor,
                                border: "none",
                                borderRadius: 20,
                                padding: "10px 20px",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                width: "100%",
                              }}
                            >
                              {form.btnText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Box>
                </Card>

                {/* Save button */}
                <InlineStack align="end">
                  <Button
                    variant="primary"
                    onClick={handlePublish}
                    {...(isPublishing ? { loading: true } : {})}
                    {...(isDisabled ? { disabled: true } : {})}
                  >
                    Save
                  </Button>
                </InlineStack>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </div>
      </div>
    </>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
