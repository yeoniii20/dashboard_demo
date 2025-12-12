interface CardSectionProps {
  data: {
    latestDuration: number;
    avgDuration: number;
    totalOpenIssues: number;
    totalCriticalIssues: number;
  };
}

const CardSection = ({ data }: CardSectionProps) => {
  return (
    <section className="flex flex-col gap-3 md:flex-row">
      <div className="flex-1 rounded-lg border border-border-default bg-bg-default px-4 py-3">
        <div className="mb-1 text-12m text-text-soft">Active Branch</div>
        <div className="text-18s text-sub_point">main</div>
        <div className="mt-2 text-12r text-text-deep">
          Last deploy: <span className="text-text-light">2025-12-12 09:21</span>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-border-default bg-bg-default px-4 py-3">
        <div className="mb-1 text-12m text-text-soft">Last Build Duration</div>
        <div className="text-18s text-point">{data.latestDuration} min</div>
        <div className="mt-2 text-12r text-text-deep">
          평균: <span className="text-text-light">{data.avgDuration} min</span>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-border-default bg-bg-default px-4 py-3">
        <div className="mb-1 text-12m text-text-soft">Open Issues</div>
        <div className="text-18s text-warning">{data.totalOpenIssues} 개</div>
        <div className="mt-2 text-12r text-text-deep">
          Critical:{" "}
          <span className="text-error">{data.totalCriticalIssues}</span>
        </div>
      </div>
    </section>
  );
};

export default CardSection;
