## GitHub Copilot Chat

- Extension: 0.48.1 (prod)
- VS Code: 1.120.0 (0958016b2af9f09bb4257e0df4a95e2f90590f9f)
- OS: win32 10.0.26100 x64
- GitHub Account: AfraSani

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.121.5 (108 ms)
- DNS ipv6 Lookup: Error (70 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (145 ms)
- Node.js https: HTTP 200 (666 ms)
- Node.js fetch: HTTP 200 (228 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.21 (105 ms)
- DNS ipv6 Lookup: Error (112 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (17 ms)
- Electron fetch (configured): HTTP 200 (202 ms)
- Node.js https: HTTP 200 (687 ms)
- Node.js fetch: HTTP 200 (695 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 20.199.39.224 (215 ms)
- DNS ipv6 Lookup: Error (29 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (13 ms)
- Electron fetch (configured): HTTP 200 (528 ms)
- Node.js https: HTTP 200 (466 ms)
- Node.js fetch: HTTP 200 (436 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (233 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (802 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (742 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (759 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (562 ms)

Number of system certificates: 76

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).