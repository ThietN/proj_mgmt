/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: [],
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
