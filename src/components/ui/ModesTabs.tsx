import { Modes } from "@/types/dashboard-registry.types";

interface ModesTabsProps {
    activeTab: Modes;
    setActiveTab: (tab: Modes) => void;
    TAB_LABEL: Record<string, string>
    className?: string;
}

export function ModesTabs({ activeTab, setActiveTab, TAB_LABEL,className ='' }: ModesTabsProps) {
    return (
       <div className={`flex ${className}   bg-surface-container-low rounded-lg p-1 border-2 border-secondary/15 hover:border-secondary`}>
                {(Object.keys(TAB_LABEL) as Modes[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                      activeTab === tab
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {TAB_LABEL[tab]}
                  </button>
                ))}
              </div>
    )
}