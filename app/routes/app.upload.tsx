import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const filename = file.name || "popup-image.jpg";
  const mimeType = file.type || "image/jpeg";

  // 1. stagedUploadsCreate
  const stagedRes = await admin.graphql(
    `#graphql
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { message }
      }
    }`,
    {
      variables: {
        input: [{ filename, mimeType, httpMethod: "POST", resource: "FILE" }],
      },
    },
  );

  const stagedData = await stagedRes.json();
  const stagedTarget = stagedData.data.stagedUploadsCreate.stagedTargets[0];

  // 2. Upload lên S3
  const uploadForm = new FormData();
  for (const param of stagedTarget.parameters) {
    uploadForm.append(param.name, param.value);
  }
  uploadForm.append("file", file);

  const uploadRes = await fetch(stagedTarget.url, {
    method: "POST",
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    return new Response(JSON.stringify({ error: "Upload to S3 failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. fileCreate
  const fileRes = await admin.graphql(
    `#graphql
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
            image { url }
          }
        }
        userErrors { message }
      }
    }`,
    {
      variables: {
        files: [
          { contentType: "IMAGE", originalSource: stagedTarget.resourceUrl },
        ],
      },
    },
  );

  const fileData = await fileRes.json();
  const createdFile = fileData.data.fileCreate.files?.[0];

  // Nếu đã có URL ngay thì trả về luôn
  if (createdFile?.image?.url) {
    return new Response(JSON.stringify({ url: createdFile.image.url }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileId = createdFile?.id;
  if (!fileId) {
    return new Response(JSON.stringify({ error: "File creation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Poll cho đến khi Shopify xử lý xong — tối đa 10 lần, mỗi lần 1.5s
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < 10; i++) {
    await sleep(1500);

    const pollRes = await admin.graphql(
      `#graphql
      query getFile($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            id
            fileStatus
            image { url }
          }
        }
      }`,
      { variables: { id: fileId } },
    );

    const pollData = await pollRes.json();
    const node = pollData.data?.node;

    console.log(
      `Poll ${i + 1}: status=${node?.fileStatus}, url=${node?.image?.url}`,
    );

    if (node?.image?.url) {
      return new Response(JSON.stringify({ url: node.image.url }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Nếu FAILED thì dừng sớm
    if (node?.fileStatus === "FAILED") {
      return new Response(JSON.stringify({ error: "File processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Timeout sau 15 giây
  return new Response(
    JSON.stringify({ error: "Timeout waiting for file URL" }),
    { status: 504, headers: { "Content-Type": "application/json" } },
  );
};
