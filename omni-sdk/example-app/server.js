import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  if (req.url.startsWith("/dist/")) {
    const relativePath = req.url.slice(1);
    const filePath = path.join(
      __dirname,
      "..",
      "packages",
      "sdk",
      relativePath
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
      }

      let contentType = "application/octet-stream";
      if (filePath.endsWith(".js")) contentType = "application/javascript";
      if (filePath.endsWith(".map")) contentType = "application/json";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║  🚀 Example App with Omni Analytics    ║
║                                        ║
║  Server running at:                   ║
║  http://localhost:${PORT}                  ║
║                                        ║
║  Press Ctrl+C to stop                 ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

process.on("SIGINT", () => {
  console.log("\n\n👋 Server shutting down...");
  process.exit(0);
});
