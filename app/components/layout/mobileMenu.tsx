import NavItem from "./navItem";

interface MobileMenuProps {
  sidebarBase: string;
  onClick: () => void;
}

const MobileMenu = ({ sidebarBase, onClick }: MobileMenuProps) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClick}>
      <aside
        className={`${sidebarBase} fixed inset-y-0 left-0 w-full h-full shadow-default flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-light px-3 py-2">
          <span className="text-12b text-text-soft">Navigation</span>
          <button
            className="rounded px-2 py-1 text-12m text-text-soft hover:bg-bg-hover"
            onClick={onClick}
          >
            닫기
          </button>
        </div>
        <NavItem onClick={onClick} />
      </aside>
    </div>
  );
};

export default MobileMenu;
