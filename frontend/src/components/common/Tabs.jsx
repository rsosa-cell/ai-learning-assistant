import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="w-full">
            {/* Tab Header */}
            <div className="relative border-b-2 border-slate-100">
                <nav className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 px-2 md:px-6 text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.name
                                    ? 'text-emerald-600'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span className="relative z-10">
                                {tab.label}
                            </span>

                            {/* Active underline */}
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/25" />
                            )}

                            {/* Active background glow */}
                            {activeTab === tab.name && (
                                <div className="absolute inset-0 bg-linear-to-r from-emerald-50/50 to-transparent rounded-t-xl -z-10" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
                {tabs.map((tab) => {
                    if (tab.name !== activeTab) return null;

                    const Content = tab.content;

                    return (
                        <div key={tab.name} className="animate-in fade-in duration-300">
                            {/* FIX: supports both function OR JSX */}
                            {typeof Content === 'function' ? (
                                <Content />
                            ) : (
                                Content
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Tabs;