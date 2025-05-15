import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import useWidgetAPI, { handlePOSTAction } from "utils/proxy/use-widget-api";
import ToggleAction from "components/services/widget/toggleAction";
import ButtonAction from "components/services/widget/buttonAction";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents");
  const { data: speedToggleStatus, mutate: fetchSpeedToggleStatus } = useWidgetAPI(widget, "speedLimitsMode", {}, { refreshInterval: 200 });
  const [isSpeedToggleEnabled, setSpeedToggle] = useState(false);
  useEffect(() => {
    if (speedToggleStatus !== undefined) {
      setSpeedToggle(speedToggleStatus === 0);
    }
  }, [speedToggleStatus]);
  
  const useApiAction = (widget, actionName) => {
    return useCallback(async () => {
      try { return await handlePOSTAction(widget, actionName); } 
      catch (error) { return false; }
    }, [widget, actionName, handlePOSTAction]);
  };

  const pauseAllTorrents = useApiAction(widget, "pauseAll");
  const resumeAllTorrents = useApiAction(widget, "resumeAll");
  const shutdown = useApiAction(widget, "shutdown");

  const toggleSpeedLimit = useCallback(async () => {
    const previousValue = isSpeedToggleEnabled;
    setSpeedToggle(!previousValue);
    try {
      const success = useApiAction(widget, "toggleSpeedLimits");
      if (!success) setSpeedToggle(previousValue);
      fetchSpeedToggleStatus();
    } catch (error) {
      setSpeedToggle(previousValue);
    }
  }, [widget, isSpeedToggleEnabled, fetchSpeedToggleStatus]);

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  const leechTorrents = [];

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
    if (torrent.state.includes("DL") || torrent.state === "downloading") {
      leechTorrents.push(torrent);
    }
  }

  const leech = torrentData.length - completed;

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block label="qbittorrent.download" value={t("common.bibyterate", { value: rateDl, decimals: 1 })} />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
        <Block label="qbittorrent.upload" value={t("common.bibyterate", { value: rateUl, decimals: 1 })} />
      </Container>
      {widget?.enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={queueEntry.progress * 100}
            timeLeft={t("common.duration", { value: queueEntry.eta })}
            title={queueEntry.name}
            activity={queueEntry.state}
            key={`${queueEntry.name}-${queueEntry.amount_left}`}
          />
        ))}
      {widget?.enableActions && (
        <>
          <ToggleAction
            checked={isSpeedToggleEnabled}
            label="Toggle Speed Limits"
            onChange={toggleSpeedLimit}
          />
          <ButtonAction
            label="pause all torrents"
            onClick={pauseAllTorrents}
            ratelimitter={200}
          />
          <ButtonAction
            label="resume all torrents"
            onClick={resumeAllTorrents}
            ratelimitter={200}
          />
          <ButtonAction
            label="shutdown"
            onClick={shutdown}
            ratelimitter={200}
            confirmation
          />
        </>
      )}
    </>
  );
}
