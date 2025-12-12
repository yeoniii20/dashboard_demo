/**
 * 차트 로딩 시에 나오는 스켈레톤
 * @param height 스켈레톤 높이
 * @returns
 */
export const ChartSkeleton = ({ height = 100 }: { height?: number }) => (
  <div
    style={{
      height: `${height}px`,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        border: "4px solid #444e5d",
        borderTop: "4px solid #afb4bb",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);
