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
import styles from "./styles/popup.module.css";

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

const POSITIONS = ["center", "bottom-left", "bottom-right"] as const;
const ANIMATIONS = ["fade", "slide"] as const;

export default function Index() {
  const { popup: initialPopup } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const publishFetcher = useFetcher();
  const shopify = useAppBridge();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [imageUploading, setImageUploading] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);

  // Default values khớp với preview đang hiển thị
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
    btnColor: "#cccc",
    image:
      "https://lavenderstudio.com.vn/wp-content/uploads/2017/03/chup-lookbook-dep-sg.jpg",
    position: "center",
    animation: "fade",
    showClose: true,
  };
  // Form state — khởi tạo từ DB
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

  // Toast khi save/publish thành công
  useEffect(() => {
    if (fetcher.data?.popup) {
      shopify.toast.show("Saved successfully");
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (publishFetcher.data?.success) {
      shopify.toast.show("Published to storefront!");
    }
    if (publishFetcher.data?.error) {
      shopify.toast.show(publishFetcher.data.error, { isError: true });
    }
  }, [publishFetcher.data]);

  const update = useCallback((key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview
    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      image: preview,
    }));

    setImageUploading(true);

    // upload lên Shopify
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/app/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setImageUploading(false);

    setForm((prev) => ({
      ...prev,
      image: data.url, // URL từ Shopify
    }));
  };

  const handleSave = () => {
    fetcher.submit(form, {
      method: "POST",
      encType: "application/json",
    });
  };

  // Thêm useEffect theo dõi fetcher.data
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

  const [pendingPublish, setPendingPublish] = useState(false);

  const handlePublish = () => {
    setPendingPublish(true);
    fetcher.submit(form, { method: "POST", encType: "application/json" });
  };

  return (
    <>
      <style>{`
      @keyframes mtu-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
      <s-page heading="Popup Builder">
        {/* Action buttons */}
        <s-button
          slot="primary-action"
          onClick={handlePublish}
          {...(isPublishing ? { loading: true } : {})}
          {...(imageUploading ? { disabled: true } : {})}
        >
          Publish
        </s-button>

        <div className={styles.pageContainer}>
          {/* Layout 2 cột */}
          <div className={styles.layoutGrid}>
            {/* CỘT TRÁI — Editor */}
            <div>
              <s-section>
                {/* Tabs */}
                <div className={styles.tabs}>
                  {(["general", "content", "design", "display"] as Tab[]).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${styles.tabButton} ${
                          activeTab === tab ? styles.tabButtonActive : ""
                        }`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>

                {/* Tab: General */}
                {activeTab === "general" && (
                  <div className={styles.stack16}>
                    <s-section heading="General Settings">
                      <s-text-field
                        label="Popup name"
                        value={form.name}
                        onChange={(e: any) => update("name", e.target.value)}
                        //helpText="Internal name, not shown to customers"
                      />
                      <p className={styles.helpText}>
                        Internal name, not shown to customers
                      </p>
                      <div className={styles.mt16}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                              update("isActive", e.target.checked)
                            }
                          />
                          <span className={styles.checkboxLabelText}>
                            Active popup
                          </span>
                        </label>
                      </div>
                      <div className={styles.mt16}>
                        <p className={styles.fieldLabel}>Delay (seconds)</p>
                        <input
                          type="number"
                          value={form.delay}
                          min={0}
                          onChange={(e) =>
                            update("delay", Number(e.target.value))
                          }
                          className={styles.delayInput}
                        />
                        <p className={styles.helpText}>
                          How long to wait before showing the popup
                        </p>
                      </div>
                    </s-section>
                  </div>
                )}

                {/* Tab: Content */}
                {activeTab === "content" && (
                  <s-section heading="Content">
                    <div className={styles.stack16}>
                      <s-text-field
                        label="Title"
                        value={form.title}
                        onChange={(e: any) => update("title", e.target.value)}
                      />
                      <div>
                        <p className={styles.fieldLabel}>Description</p>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            update("description", e.target.value)
                          }
                          rows={3}
                          className={styles.textarea}
                        />
                      </div>
                      <s-text-field
                        label="Button text"
                        value={form.btnText}
                        onChange={(e: any) => update("btnText", e.target.value)}
                      />
                      <s-text-field
                        label="Button link"
                        value={form.btnLink}
                        onChange={(e: any) => update("btnLink", e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </s-section>
                )}

                {/* Tab: Design */}
                {activeTab === "design" && (
                  <s-section heading="Design">
                    <div className={styles.stack20}>
                      <div>
                        <p className={styles.fieldLabel}>Background color</p>

                        <div className={styles.row8}>
                          {/* Input text */}
                          <input
                            type="text"
                            value={form.bgColor}
                            onChange={(e) => update("bgColor", e.target.value)}
                            className={styles.textInput}
                          />

                          {/* Color picker */}
                          <input
                            type="color"
                            value={form.bgColor}
                            onChange={(e) => update("bgColor", e.target.value)}
                            className={styles.colorInput}
                          />
                        </div>
                      </div>
                      {/* Text color */}
                      <div>
                        <p className={styles.fieldLabel}>Text color</p>
                        <div className={styles.row8}>
                          <input
                            type="text"
                            value={form.textColor}
                            onChange={(e) =>
                              update("textColor", e.target.value)
                            }
                            className={styles.textInput}
                          />
                          <input
                            type="color"
                            value={form.textColor}
                            onChange={(e) =>
                              update("textColor", e.target.value)
                            }
                            className={styles.colorInput}
                          />
                        </div>
                      </div>

                      {/* Button color */}
                      <div>
                        <p className={styles.fieldLabel}>Button color</p>
                        <div className={styles.row8}>
                          <input
                            type="text"
                            value={form.btnColor}
                            onChange={(e) => update("btnColor", e.target.value)}
                            className={styles.textInput}
                          />
                          <input
                            type="color"
                            value={form.btnColor}
                            onChange={(e) => update("btnColor", e.target.value)}
                            className={styles.colorInput}
                          />
                        </div>
                      </div>
                      <div>
                        <p className={styles.fieldLabel}>Image</p>

                        {/* Preview */}
                        {form.image && (
                          <div
                            style={{ position: "relative", marginBottom: 12 }}
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
                                    borderTop: "3px solid #ffffff",
                                    borderRadius: "50%",
                                    animation: "mtu-spin 0.8s linear infinite",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Upload */}
                        <label className={styles.fileButton}>
                          {imageUploading ? "Uploading..." : "Choose file"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={imageUploading}
                            className={styles.hiddenInput}
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </s-section>
                )}

                {/* Tab: Display */}
                {activeTab === "display" && (
                  <s-section heading="Display Settings">
                    <div className={styles.stack16}>
                      <div>
                        <p className={styles.fieldLabel8}>Position</p>
                        <div className={styles.row8}>
                          {POSITIONS.map((pos) => (
                            <button
                              key={pos}
                              onClick={() => update("position", pos)}
                              className={`${styles.optionButton} ${
                                form.position === pos
                                  ? styles.optionButtonActive
                                  : ""
                              }`}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className={styles.fieldLabel8}>Animation</p>
                        <div className={styles.row8}>
                          {ANIMATIONS.map((anim) => (
                            <button
                              key={anim}
                              onClick={() => update("animation", anim)}
                              className={`${styles.optionButton} ${
                                form.animation === anim
                                  ? styles.optionButtonActive
                                  : ""
                              }`}
                            >
                              {anim}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={form.showClose}
                          onChange={(e) =>
                            update("showClose", e.target.checked)
                          }
                        />
                        <span className={styles.checkboxLabelText}>
                          Show close button
                        </span>
                      </label>
                    </div>
                  </s-section>
                )}
              </s-section>
            </div>

            {/* CỘT PHẢI — Preview */}
            <div>
              <s-section heading="Preview">
                <div className={styles.previewPanel}>
                  {/* Popup Preview */}
                  <div
                    className={styles.previewCanvas}
                    style={{
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
                      className={styles.previewPopup}
                      style={{
                        background: form.bgColor,
                        color: form.textColor,
                      }}
                    >
                      {form.showClose && (
                        <button
                          className={styles.closeButton}
                          style={{
                            color: form.textColor,
                          }}
                        >
                          ✕
                        </button>
                      )}
                      {form.image && (
                        <div className={styles.previewImageContainer}>
                          <img
                            src={form.image}
                            alt=""
                            className={styles.previewImage}
                          />
                        </div>
                      )}
                      <div
                        className={styles.previewContent}
                        style={{
                          color: form.textColor,
                        }}
                      >
                        <h3
                          className={styles.previewTitle}
                          style={{
                            color: form.textColor,
                          }}
                        >
                          {form.title}
                        </h3>
                        <p
                          className={styles.previewDescription}
                          style={{
                            color: form.textColor,
                          }}
                        >
                          {form.description}
                        </p>
                        {form.btnText && (
                          <button
                            className={styles.previewCta}
                            style={{
                              background: form.btnColor,
                              color: form.textColor,
                            }}
                          >
                            {form.btnText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </s-section>
              {/* button save */}
              <div className={styles.saveRow}>
                <s-button
                  onClick={handleSave}
                  loading={isSaving || imageUploading ? true : undefined}
                  {...(imageUploading ? { disabled: true } : {})}
                >
                  Save
                </s-button>
              </div>
            </div>
          </div>
        </div>
      </s-page>
    </>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
