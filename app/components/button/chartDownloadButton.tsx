import { Download } from "lucide-react";

type ChartDownloadButtonProps = {
  visible: boolean;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
};

export default function ChartDownloadButton({
  visible,
  onClick,
  title = "Download as Excel",
  disabled = false,
  className = "",
}: ChartDownloadButtonProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 10,
        borderRadius: 6,
        padding: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,

        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Download size={16} />
    </button>
  );
}
