import { usePathname, useRouter } from "next/navigation";

interface NavItemProps {
  onClick: () => void;
}

const NavItem = ({ onClick }: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = {
    dashboard: { label: "Overview", path: "/dashboard" },
    server: { label: "Server", path: "/dashboard/server" },
    queue: { label: "Queue", path: "/dashboard/queue" },
    topic: { label: "Topic", path: "/dashboard/topic" },
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    onClick();
  };

  return (
    <nav className="flex-1 space-y-3 px-2 py-3 text-13 text-text-soft">
      <div>
        <div className="mb-2 text-11 font-semibold uppercase text-text-deep">
          Dashboard
        </div>
        <button
          className={`flex w-full items-center rounded px-2 py-1 text-left text-12m hover:bg-bg-hover ${
            pathname === navItems.dashboard.path ? "bg-bg-hover" : ""
          }`}
          onClick={() => handleNavClick(navItems.dashboard.path)}
        >
          <span>{navItems.dashboard.label}</span>
        </button>
      </div>

      <div>
        <div className="mb-2 text-11 font-semibold uppercase text-text-deep">
          Detail
        </div>
        <button
          className={`flex w-full items-center rounded px-2 py-1 text-left text-12m hover:bg-bg-hover ${
            pathname === navItems.server.path ? "bg-bg-hover" : ""
          }`}
          onClick={() => handleNavClick(navItems.server.path)}
        >
          <span>{navItems.server.label}</span>
        </button>
        <button
          className={`flex w-full items-center rounded px-2 py-1 text-left text-12m hover:bg-bg-hover ${
            pathname === navItems.queue.path ? "bg-bg-hover" : ""
          }`}
          onClick={() => handleNavClick(navItems.queue.path)}
        >
          <span>{navItems.queue.label}</span>
        </button>
        <button
          className={`flex w-full items-center rounded px-2 py-1 text-left text-12m hover:bg-bg-hover ${
            pathname === navItems.topic.path ? "bg-bg-hover" : ""
          }`}
          onClick={() => handleNavClick(navItems.topic.path)}
        >
          <span>{navItems.topic.label}</span>
        </button>
      </div>
    </nav>
  );
};
export default NavItem;
