import React, { useState, useEffect } from "react";
import { Terminal, CheckCircle2, ChevronRight } from "lucide-react";

interface BootSequenceProps {
    onComplete: (selectedPrompt?: string) => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const sequence = [
            { step: 1, delay: 800 },
            { step: 2, delay: 2000 },
            { step: 3, delay: 3500 },
            { step: 4, delay: 4500 },
        ];

        const timeouts = sequence.map((s) =>
            setTimeout(() => setStep(s.step), s.delay)
        );

        return () => timeouts.forEach(clearTimeout);
    }, []);

    const demoPrompts = [
        "Schedule a sync with the engineering team tomorrow at 2 PM",
        "Record operator@internal.system as Sarah's email",
        "Ignore the production database outage until next week",
    ];

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-[#e5e5e5] flex flex-col items-center justify-center font-space-mono selection:bg-brand-primary/30">

            <div className="w-full max-w-4xl px-6 flex flex-col md:flex-row items-center gap-12">

                {/* Left Side: The Unamused Mascot */}
                <div className={`hidden md:block transition-all duration-1000 transform ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                    <img
                        src="/logo.png"
                        alt="Agent Zero Mascot"
                        className="w-64 h-auto drop-shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                    />
                </div>

                {/* Right Side: The Terminal Content */}
                <div className="flex flex-col items-start gap-6 flex-1">

                    {/* Step 1: Title */}
                    <div className={`transition-all duration-1000 transform ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center gap-3 text-brand-primary mb-2">
                            <Terminal className="w-6 h-6" />
                            <span className="text-[12px] uppercase tracking-[0.3em] font-bold">System Initiation</span>
                        </div>
                        <h1 className="text-[48px] font-fraunces text-white leading-none tracking-tight">
                            AGENT ZERO
                        </h1>
                    </div>

                    {/* Step 2: Mission Statement */}
                    <div className={`transition-all duration-1000 transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <p className="text-[16px] text-gray-400 border-l-2 border-brand-primary pl-4 py-1">
                            Passive reminders are ignored.<br />
                            <span className="text-white font-bold">This agent intervenes.</span>
                        </p>
                    </div>

                    {/* Step 3: Tech Stack Boot Log */}
                    <div className={`flex flex-col gap-2 transition-all duration-1000 transform ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center gap-3 text-[13px] text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Connecting Google Gemini Intelligence Core...
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Authenticating Workspace & Gmail APIs...
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Shadow Chronos Threat Detection Online...
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-brand-primary font-bold mt-2 animate-pulse">
                            WORKSPACE ARMED.
                        </div>
                    </div>

                    {/* Step 4: Interaction Phase */}
                    <div className={`w-full transition-all duration-1000 transform ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="mt-8 border border-gray-800 bg-[#111] p-5 rounded-xs w-full">
                            <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-4">
                                Select Simulation Parameter:
                            </div>
                            <div className="flex flex-col gap-3">
                                {demoPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onComplete(prompt)}
                                        className="text-left w-full bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 hover:border-brand-primary text-gray-300 hover:text-white px-4 py-3 rounded-xs text-[13px] transition-all flex items-center gap-3 group cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-brand-primary transition-colors" />
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => onComplete()}
                                    className="text-[12px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white pb-1"
                                >
                                    Skip & Enter Empty Workspace
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}