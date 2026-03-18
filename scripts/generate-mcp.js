import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mcp = {
  "protocolVersion": "2025-06-18",
  "serverInfo": {
    "name": "Smug Media Tracker",
    "version": "1.0.0"
  },
  "capabilities": {
    "resources": [
      {
        "uri": "file://about.txt",
        "name": "About Smug",
        "description": "Information about the Smug media tracker",
        "mimeType": "text/plain"
      }
    ],
    "tools": []
  }
};

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'mcp.json'), JSON.stringify(mcp, null, 2));

const resourcesDir = path.join(publicDir, 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

fs.writeFileSync(path.join(resourcesDir, 'about.txt.json'), JSON.stringify({
  uri: "file://about.txt",
  mimeType: "text/plain",
  text: "Smug is a progressive web app for tracking media consumption including movies, tv shows, books, and games."
}, null, 2));

console.log('StaticMCP files generated successfully.');
