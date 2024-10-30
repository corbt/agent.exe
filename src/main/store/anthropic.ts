import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { SocksProxyAgent } from 'socks-proxy-agent';

dotenv.config();

// Initialize Anthropic client with or without proxy based on configuration
const anthropicConfig: {
  apiKey: string;
  baseURL: string;
  httpAgent?: SocksProxyAgent;
  timeout: number;
} = {
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
  timeout: 60000,
};

// Configure SOCKS5 proxy if proxy settings are provided in environment variables
if (process.env.PROXY_HOST_NAME && process.env.PROXY_PORT) {
  // Create proxy configuration
  const proxyOptions = {
    hostname: process.env.PROXY_HOST_NAME,
    port: parseInt(process.env.PROXY_PORT, 10),
    // Optional: Add authentication if required
    // username: process.env.PROXY_USERNAME,
    // password: process.env.PROXY_PASSWORD,
  };

  // Initialize SOCKS5 proxy agent
  const socksAgent = new SocksProxyAgent(
    `socks5://${proxyOptions.hostname}:${proxyOptions.port}`,
  );

  // Add proxy agent to Anthropic configuration
  anthropicConfig.httpAgent = socksAgent;
}

// Create and export Anthropic client instance
export const anthropic = new Anthropic(anthropicConfig);
