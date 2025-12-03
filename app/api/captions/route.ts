// import { NextRequest } from "next/server";

// const PY_CAPTION_SERVICE_URL = process.env.PY_CAPTION_SERVICE_URL;

// if (!PY_CAPTION_SERVICE_URL) {
//   console.warn("PY_CAPTION_SERVICE_URL is not set in .env.local");
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const videoId = body?.videoId as string | undefined;

//     if (!videoId) {
//       return new Response(JSON.stringify({ error: "Missing videoId" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     if (!PY_CAPTION_SERVICE_URL) {
//       return new Response(
//         JSON.stringify({ error: "Caption service not configured" }),
//         {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//         },
//       );
//     }

//     const res = await fetch(
//       `${PY_CAPTION_SERVICE_URL}/captions/${encodeURIComponent(videoId)}`,
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       return new Response(
//         JSON.stringify({
//           error: "Python caption service error",
//           details: data,
//         }),
//         {
//           status: res.status,
//           headers: { "Content-Type": "application/json" },
//         },
//       );
//     }

//     return new Response(JSON.stringify(data), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Internal error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  return new Response(
    JSON.stringify({ ok: true, method: "GET", path: "/api/captions" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return new Response(
    JSON.stringify({
      ok: true,
      method: "POST",
      path: "/api/captions",
      body,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}