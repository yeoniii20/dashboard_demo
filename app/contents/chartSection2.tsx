import CustomChart from "@/app/components/chart/customChart";
import { BubblePoint, RadarPoint } from "@/app/types/dashboard";

interface ChartSection {
  data: {
    bubblePerfData: BubblePoint[];
    radarQualityData: RadarPoint[];
  };
}

const ChartSection2 = ({ data }: ChartSection) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {/* Bubble Chart */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Build Performance Bubble</h3>
          <span className="text-[11px] text-text-soft">
            x: duration, y: coverage, r: impact
          </span>
        </div>

        <CustomChart
          type="bubble"
          datasets={[
            {
              label: "Services",
              data: data.bubblePerfData,
              borderColor: "#c187e2",
              backgroundColor: "#c187e233",
            },
          ]}
          options={{
            height: 240,
            showLegend: true,
            legendPosition: "bottom",
            animationOff: true,
            useCustomLegend: true,
          }}
        />
      </div>

      {/* Radar Chart */}
      <div className="rounded-lg border border-border-default bg-bg-default p-4 pb-7">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-12b text-text-light">Quality Radar</h3>
          <span className="text-[11px] text-text-soft">
            Team quality metrics
          </span>
        </div>

        <CustomChart
          type="radar"
          datasets={[
            {
              label: "Current",
              data: data.radarQualityData,
              borderColor: "#9cdcfe",
              backgroundColor: "#9cdcfe33",
              fill: true,
            },
          ]}
          options={{
            height: 240,
            showLegend: true,
            legendPosition: "bottom",
            useCustomLegend: true,
          }}
        />
      </div>
    </section>
  );
};

export default ChartSection2;
