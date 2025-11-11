// /src/config/webContainer.js
import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let isBooting = false;

/**
 * Initialize or return an existing WebContainer instance safely.
 */
export async function getWebContainer() {
  // If a container is already booting, wait until it's ready
  if (isBooting) {
    console.log("Waiting for existing WebContainer to finish booting...");
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (!isBooting && webContainerInstance) {
          clearInterval(check);
          resolve(webContainerInstance);
        } else if (!isBooting && !webContainerInstance) {
          clearInterval(check);
          reject(new Error("WebContainer failed to initialize."));
        }
      }, 200);
    });
  }

  // If already initialized, return it
  if (webContainerInstance) {
    console.log("Reusing existing WebContainer instance");
    return webContainerInstance;
  }

  try {
    isBooting = true;
    console.log("Booting new WebContainer instance...");

    webContainerInstance = await WebContainer.boot();

    webContainerInstance.on('error', (err) => {
      console.error("WebContainer runtime error:", err);
    });

    console.log("✅ WebContainer initialized successfully");
    return webContainerInstance;
  } catch (error) {
    console.error("❌ Failed to start WebContainer:", error);

    if (error.message.includes("Unable to create more instances")) {
      alert(
        "⚠️ You can only create one WebContainer per tab.\nPlease close other running instances or refresh the page."
      );
    }
    return null;
  } finally {
    isBooting = false;
  }
}

/**
 * Optional cleanup function (call on page unload)
 */
export function disposeWebContainer() {
  if (webContainerInstance) {
    try {
      console.log("🧹 Disposing WebContainer instance...");
      webContainerInstance.teardown?.();
    } catch (err) {
      console.warn("Failed to dispose WebContainer:", err);
    } finally {
      webContainerInstance = null;
    }
  }
}
