import { useState } from "react";

import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";

import "./styles/global.css";
import "./styles/sidebar.css";
import "./styles/home.css";
import "./styles/upload.css";
import "./styles/result.css";
import "./styles/panels.css";
import "./styles/training.css";

function App() {
  const [activeSection, setActiveSection] =
    useState("classify");

  const [darkMode, setDarkMode] = useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`app ${
        darkMode ? "dark-theme" : ""
      }`}
    >
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Home
        activeSection={activeSection}
        darkMode={darkMode}
        onToggleTheme={() =>
          setDarkMode((current) => !current)
        }
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}

export default App;