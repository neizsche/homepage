import qbittorrentProxyHandler from "./proxy";

const widget = {
  proxyHandler: qbittorrentProxyHandler,

  mappings: {
    torrents: {
      endpoint: "torrents/info",
    },
    toggleSpeedLimits: {
      endpoint: "transfer/toggleSpeedLimitsMode",
      method: "POST",
    },
    speedLimitsMode: {
      endpoint: "transfer/speedLimitsMode",
    },
    pauseAll: {
      endpoint: "torrents/stop",
      method: "POST",
      body: "hashes=all",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
    resumeAll: {
      endpoint: "torrents/start",
      method: "POST",
      body: "hashes=all",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
    shutdown: {
      endpoint: "app/shutdown",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
  },
};

export default widget;
