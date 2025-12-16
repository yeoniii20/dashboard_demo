interface HeaderProps {
  onClick: () => void;
}

const Header = ({ onClick }: HeaderProps) => {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border-default bg-bg-default px-3 md:px-4">
      <div className="flex items-center gap-3">
        {/* 햄버거 버튼 (모바일 전용) */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded md:hidden hover:bg-bg-hover"
          onClick={onClick}
          aria-label="Toggle sidebar"
        >
          <span className="text-xl leading-none">☰</span>
        </button>

        <span className="text-16b text-text-default">Dashboard</span>
      </div>

      <div className="flex items-center gap-3 text-12m text-text-soft">
        <span className="hidden sm:inline">
          Status: <span className="text-sub_green">Online</span>
        </span>
        <span className="rounded bg-bg-hover px-2 py-1 text-11r text-text-soft">
          v0.1.0
        </span>
      </div>
    </header>
  );
};

export default Header;
