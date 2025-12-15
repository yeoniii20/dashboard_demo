import { usePathname, useRouter } from "next/navigation";

interface NavItemProps {
  onClick: () => void;
}

type NavLink = {
  key: string;
  label: string;
  path: string;
};

type NavSection = {
  title: string;
  items: NavLink[];
};

const NavItem = ({ onClick }: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Dashboard",
      items: [{ key: "dashboard", label: "Overview", path: "/" }],
    },
    {
      title: "Detail",
      items: [
        { key: "server", label: "Server", path: "/dashboard/server" },
        { key: "queue", label: "Queue", path: "/dashboard/queue" },
        { key: "topic", label: "Topic", path: "/dashboard/topic" },
        { key: "status", label: "Status", path: "/dashboard/status" },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    onClick();
  };

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <nav className="flex-1 space-y-3 px-2 py-3 text-13 text-text-soft">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-2 text-11r font-semibold uppercase text-text-deep">
            {section.title}
          </div>

          {section.items.map((item) => (
            <button
              key={item.key}
              className={`flex w-full items-center rounded px-2 py-1 text-left text-12m hover:bg-bg-hover ${
                isActive(item.path) ? "bg-bg-hover" : ""
              }`}
              onClick={() => handleNavClick(item.path)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default NavItem;
