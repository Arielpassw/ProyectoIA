import {
  Menu,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

function Header({
  title,
  subtitle,
  darkMode,
  onToggleTheme,
  onOpenSidebar,
}) {
  return (
    <header className="main-header">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onOpenSidebar}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <div className="header-title">
        <div className="title-icon">
          <Sparkles size={28} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        className="theme-button"
        onClick={onToggleTheme}
        aria-label="Cambiar tema"
      >
        {darkMode ? (
          <Sun size={21} />
        ) : (
          <Moon size={21} />
        )}
      </button>
    </header>
  );
}

export default Header;