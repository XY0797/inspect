export const gmOk = () => {
  return !!window.__GmNetworkExtension?.GM_xmlhttpRequest;
};
const corsOkOrigins = new Set([
  location.origin,
  `https://cdn.jsdelivr.net`,
  `https://fastly.jsdelivr.net`,
  `https://raw.githubusercontent.com`,
  `https://raw.githubusercontents.com`,
  `https://raw.gitmirror.com`,
  `http://10.2.147.177:8888`,
]);

const browser_allow_cors = () => {
  // 1. browser extensions modify response headers
  // 2. browser startup parameter, chrome --disable-web-security
  // 3. electronjs
  return localStorage.getItem(`--browser_allow_cors`) == `1`;
};

export const enhanceFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  if (browser_allow_cors()) {
    return fetch(input, init);
  }

  const u = new URL(new Request(input).url);
  if (corsOkOrigins.has(u.origin)) {
    return fetch(input, init);
  }

  if (gmOk()) {
    // with cookie
    // export need
    return GM_fetch(input, init);
  }

  const proxyUrl = new URL(`https://proxy-workers.lisonge.workers.dev/`);
  proxyUrl.searchParams.set(`proxyUrl`, u.href);
  const request = new Request(input, init);
  return fetch(proxyUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
};

export const GM_xmlhttpRequest: typeof window.__GmNetworkExtension.GM_xmlhttpRequest =
  (...args) => {
    return window.__GmNetworkExtension?.GM_xmlhttpRequest(...args);
  };

export const GM_fetch: typeof window.__GmNetworkExtension.GM_fetch = (
  ...args
) => {
  return window.__GmNetworkExtension?.GM_fetch(...args);
};
