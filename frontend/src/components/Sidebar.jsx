import {
    ChartNoAxesCombined,
    History,
    ImageIcon,
    Info,
    Shirt,
    Sparkles,
    X,
} from "lucide-react";

function Sidebar({
    activeSection,
    onSectionChange,
    sidebarOpen,
    onClose,
}) {
    const options = [
        {
            id: "classify",
            label: "Clasificar",
            icon: ImageIcon,
        },
        {
            id: "training",
            label: "Entrenamiento",
            icon: ChartNoAxesCombined,
        },
        {
            id: "history",
            label: "Historial",
            icon: History,
        },
        {
            id: "about",
            label: "Acerca de",
            icon: Info,
        },
    ];

    return (
        <>
            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                />
            )}

            <aside
                className={`sidebar ${sidebarOpen ? "sidebar-open" : ""
                    }`}
            >
                <button
                    type="button"
                    className="sidebar-close"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                >
                    <X size={22} />
                </button>

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Shirt size={30} />
                    </div>

                    <div>
                        <h1>Fashion AI</h1>
                        <p>Clasificador de prendas</p>
                    </div>
                </div>

                <nav className="sidebar-navigation">
                    {options.map((option) => {
                        const Icon = option.icon;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={`navigation-item ${activeSection === option.id
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    onSectionChange(option.id)
                                }
                            >
                                <Icon size={20} />
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-message">
                    <Sparkles size={24} />

                    <h3>IA que entiende tu estilo</h3>

                    <p>
                        Identificamos tus prendas mediante
                        inteligencia artificial.
                    </p>

                    <div className="sidebar-shirt-decoration">
                        <Shirt size={56} />
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;