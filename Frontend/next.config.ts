import type { NextConfig } from "next";
import os from "os";

// Automatically discover all local network IPv4 addresses
function getLocalNetworkOrigins(): string[] {
  const origins = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.localhost",
  ];

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          origins.push(iface.address);
        }
      }
    }
  } catch {
    // ignore
  }

  // Common local subnet IP patterns and known interface addresses
  origins.push("172.18.232.105", "26.237.30.132");

  return Array.from(new Set(origins));
}

const nextConfig: NextConfig = {
  // Allow all network / LAN origins so WebSocket HMR connects without 403 on other devices
  allowedDevOrigins: getLocalNetworkOrigins(),
};

export default nextConfig;
