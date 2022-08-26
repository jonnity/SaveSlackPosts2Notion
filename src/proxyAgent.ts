require("dotenv").config();
import { HttpsProxyAgent } from "https-proxy-agent";

const proxy = process.env.HTTP_PROXY;
const proxyAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

export { proxyAgent };
