/** @type {import('next').NextConfig} */
import { createRequire } from "module";
import withPWA from "next-pwa";

// Check if element-tagger is available
function isElementTaggerAvailable() {
    try {
        const require = createRequire(import.meta.url);
        require.resolve("@softgenai/element-tagger");
        return true;
    } catch {
        return false;
    }
}

// Build turbo rules only if tagger is available
function getTurboRules() {
    if (!isElementTaggerAvailable()) {
        console.log(
            "[Softgen] Element tagger not found, skipping loader configuration"
        );
        return {};
    }

    return {
        "*.tsx": ["@softgenai/element-tagger"],
        "*.jsx": ["@softgenai/element-tagger"],
    };
}

const nextConfig = {
    reactStrictMode: true,
    experimental: {
        turbo: {
            rules: getTurboRules(),
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    allowedDevOrigins: ["*.daytona.work", "*.softgen.dev"],
};

const pwaConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-image-assets",
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: /\.(?:js)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-js-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: /\.(?:css|less)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-style-assets",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60,
                },
            },
        },
    ],
});

export default pwaConfig(nextConfig);