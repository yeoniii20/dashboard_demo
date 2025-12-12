const Footer = () => {
  return (
    <footer className="flex items-center justify-between border-t border-border-default bg-bg-default px-3 py-2 text-[11px] text-text-soft">
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">
          Cluster: <span className="text-sub_point">default</span>
        </span>
        <span>
          Servers: <span className="text-lightblue">3</span> · Queues:{" "}
          <span className="text-lightblue">12</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden xs:inline">Latency: 23ms</span>
        <span className="hidden sm:inline">Uptime: 99.97%</span>
        <span className="rounded bg-bg-hover px-2 py-1 text-[10px]">
          Queue Monitoring
        </span>
      </div>
    </footer>
  );
};

export default Footer;
