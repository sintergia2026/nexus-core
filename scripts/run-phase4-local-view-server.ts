import fs from "fs";
import path from "path";
import http from "http";
import { GET as getActiveRoute } from "../07_app/api/internal/records/active/route";
import { GET as getQueryRoute } from "../07_app/api/internal/records/query/route";
import { POST as postCompareRoute } from "../07_app/api/internal/records/compare/route";

const PORT = 4310;

function sendText(
  res: http.ServerResponse,
  status: number,
  body: string,
  contentType = "text/plain; charset=utf-8"
): void {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(body);
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown
): void {
  sendText(res, status, JSON.stringify(body, null, 2), "application/json; charset=utf-8");
}

function getViewHtml(): string {
  const fullPath = path.resolve(
    __dirname,
    "../07_app/web/internal-records-view/index.html"
  );
  return fs.readFileSync(fullPath, "utf-8");
}

async function readRequestBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

function toAbsoluteUrl(req: http.IncomingMessage): string {
  const host = req.headers.host ?? `localhost:${PORT}`;
  const url = req.url ?? "/";
  return `http://${host}${url}`;
}

async function handleRouteResponse(
  res: http.ServerResponse,
  response: Response
): Promise<void> {
  const text = await response.text();
  const contentType =
    response.headers.get("content-type") ?? "application/json; charset=utf-8";

  res.writeHead(response.status, { "Content-Type": contentType });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  try {
    const method = req.method ?? "GET";
    const url = req.url ?? "/";

    if (method === "GET" && (url === "/" || url === "/internal-records-view")) {
      return sendText(res, 200, getViewHtml(), "text/html; charset=utf-8");
    }

    if (method === "GET" && url.startsWith("/internal/api/records/active")) {
      const request = new Request(toAbsoluteUrl(req), { method: "GET" });
      const response = await getActiveRoute(request);
      return handleRouteResponse(res, response);
    }

    if (method === "GET" && url.startsWith("/internal/api/records/query")) {
      const request = new Request(toAbsoluteUrl(req), { method: "GET" });
      const response = await getQueryRoute(request);
      return handleRouteResponse(res, response);
    }

    if (method === "POST" && url === "/internal/api/records/compare") {
      const body = await readRequestBody(req);

      const request = new Request(toAbsoluteUrl(req), {
        method: "POST",
        headers: {
          "Content-Type": req.headers["content-type"] ?? "application/json",
        },
        body,
      });

      const response = await postCompareRoute(request);
      return handleRouteResponse(res, response);
    }

    if (method === "GET" && url === "/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "phase4-local-view-server",
        port: PORT,
      });
    }

    return sendJson(res, 404, {
      ok: false,
      error: "NOT_FOUND",
      path: url,
      method,
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(PORT, () => {
  console.log("==================================================");
  console.log("NEXUS PHASE 4 LOCAL VIEW SERVER");
  console.log("==================================================");
  console.log(`View URL: http://localhost:${PORT}/internal-records-view`);
  console.log(`Health URL: http://localhost:${PORT}/health`);
  console.log("==================================================");
});