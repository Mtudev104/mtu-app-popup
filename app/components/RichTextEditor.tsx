import { useRef, useEffect } from "react";
import { Text, Box, Icon } from "@shopify/polaris";
import {
  TextBoldIcon,
  TextUnderlineIcon,
  TextItalicIcon,
  TextColorIcon,
  TextAlignLeftIcon,
  ListNumberedIcon,
  ListBulletedIcon,
  LinkIcon,
} from "@shopify/polaris-icons";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const StrikeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.625 7.42045C12.5644 6.88258 12.3144 6.46591 11.875 6.17045C11.4356 5.87121 10.8826 5.72159 10.2159 5.72159C9.73864 5.72159 9.32576 5.79735 8.97727 5.94886C8.62879 6.09659 8.35795 6.30114 8.16477 6.5625C7.97538 6.82008 7.88068 7.11364 7.88068 7.44318C7.88068 7.7197 7.94508 7.95833 8.07386 8.15909C8.20644 8.35985 8.37879 8.52841 8.59091 8.66477C8.80682 8.79735 9.03788 8.90909 9.28409 9C9.5303 9.08712 9.76705 9.15909 9.99432 9.21591L11.1307 9.51136C11.5019 9.60227 11.8826 9.72538 12.2727 9.88068C12.6629 10.036 13.0246 10.2405 13.358 10.4943C13.6913 10.7481 13.9602 11.0625 14.1648 11.4375C14.3731 11.8125 14.4773 12.2614 14.4773 12.7841C14.4773 13.4432 14.3068 14.0284 13.9659 14.5398C13.6288 15.0511 13.1383 15.4545 12.4943 15.75C11.8542 16.0455 11.0795 16.1932 10.1705 16.1932C9.29924 16.1932 8.54545 16.0549 7.90909 15.7784C7.27273 15.5019 6.77462 15.1098 6.41477 14.6023C6.05492 14.0909 5.85606 13.4848 5.81818 12.7841H7.57955C7.61364 13.2045 7.75 13.5549 7.98864 13.8352C8.23106 14.1117 8.53977 14.3182 8.91477 14.4545C9.29356 14.5871 9.70833 14.6534 10.1591 14.6534C10.6553 14.6534 11.0966 14.5758 11.483 14.4205C11.8731 14.2614 12.1799 14.0417 12.4034 13.7614C12.6269 13.4773 12.7386 13.1458 12.7386 12.767C12.7386 12.4223 12.6402 12.1402 12.4432 11.9205C12.25 11.7008 11.9867 11.5189 11.6534 11.375C11.3239 11.2311 10.9508 11.1042 10.5341 10.9943L9.15909 10.6193C8.22727 10.3655 7.48864 9.99242 6.94318 9.5C6.40152 9.00758 6.13068 8.35606 6.13068 7.54545C6.13068 6.875 6.3125 6.28977 6.67614 5.78977C7.03977 5.28977 7.5322 4.90151 8.15341 4.625C8.77462 4.3447 9.47538 4.20455 10.2557 4.20455C11.0436 4.20455 11.7386 4.3428 12.3409 4.61932C12.947 4.89583 13.4242 5.27652 13.7727 5.76136C14.1212 6.24242 14.303 6.79545 14.3182 7.42045H12.625Z"
      fill="#4A4A4A"
    ></path>
    <path d="M5 10.7614H15.2955V11.8523H5V10.7614Z" fill="#4A4A4A"></path>
  </svg>
);

const TOOLS = [
  { id: "bold", icon: TextBoldIcon, cmd: "bold" },
  { id: "underline", icon: TextUnderlineIcon, cmd: "underline" },
  { id: "italic", icon: TextItalicIcon, cmd: "italic" },
  { id: "strike", icon: StrikeIcon, cmd: "strikeThrough" },
  { id: "color", icon: TextColorIcon, cmd: "foreColor" },
  { id: "align-left", icon: TextAlignLeftIcon, cmd: "justifyLeft" },
  { id: "ordered-list", icon: ListNumberedIcon, cmd: "insertOrderedList" },
  { id: "unordered-list", icon: ListBulletedIcon, cmd: "insertUnorderedList" },
  { id: "link", icon: LinkIcon, cmd: "createLink" },
];

export function RichTextEditor({ label, value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      prevValueRef.current = value;
    }
  }, []);

  useEffect(() => {
    if (
      editorRef.current &&
      value !== editorRef.current.innerHTML &&
      value !== prevValueRef.current
    ) {
      editorRef.current.innerHTML = value;
      prevValueRef.current = value;
    }
  }, [value]);

  const exec = (cmd: string, value?: string) => {
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (!url) return;
      document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, value);
    }
    editorRef.current?.focus();
    const html = editorRef.current?.innerHTML || "";
    prevValueRef.current = html; // ← cập nhật prevValueRef
    onChange(html);
  };

  return (
    <div>
      <Text as="p" variant="bodyMd" fontWeight="medium">
        {label}
      </Text>
      <Box paddingBlockStart="100">
        <div
          style={{
            border: "1px solid #8c9196",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Menubar */}
          <div
            style={{
              borderBottom: "1px solid #e1e3e5",
              padding: "4px 8px",
              display: "flex",
              gap: 2,
              background: "#f6f6f7",
            }}
          >
            {TOOLS.map((btn) => {
              if (btn.id === "color") {
                return (
                  <div key={btn.id} style={{ position: "relative" }}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        width: 32,
                        height: 32,
                        border: "none",
                        background: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon source={btn.icon} />
                    </button>

                    <input
                      type="color"
                      onChange={(e) => exec("foreColor", e.target.value)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                );
              }

              return (
                <button
                  key={btn.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec(btn.cmd);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: "none",
                    background: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#444",
                  }}
                >
                  <Icon source={btn.icon} />
                </button>
              );
            })}
          </div>

          {/* Editor area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              onChange(editorRef.current?.innerHTML || "");
              prevValueRef.current = editorRef.current?.innerHTML || "";
            }}
            style={{
              minHeight: 80,
              padding: "8px 12px",
              fontSize: 14,
              outline: "none",
              background: "#fff",
              lineHeight: 1.5,
            }}
          />
        </div>
      </Box>
    </div>
  );
}
