import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { DashboardPage } from "./pages/DashboardPage";
import { RelicsPage } from "./pages/RelicsPage";
import { DamagesPage } from "./pages/DamagesPage";
import { PlansPage } from "./pages/PlansPage";
import { ImagesPage } from "./pages/ImagesPage";
import "./styles.css";

const pageMap: Record<string, () => JSX.Element> = {
  "/dashboard": DashboardPage,
  "/relics": RelicsPage,
  "/damages": DamagesPage,
  "/plans": PlansPage,
  "/images": ImagesPage
};

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const CurrentPage = pageMap[active] ?? DashboardPage;
  return (
    <div className="shell">
      <aside>
        <div className="brand">文物修复档案协作平台</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <CurrentPage />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
