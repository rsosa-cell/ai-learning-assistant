import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped((prev) => !prev);
    };

    return (
        <div
            className="relative w-full h-72"
            style={{ perspective: "1000px" }}
        >
            <div
                className="relative w-full h-full transition-transform duration-500 cursor-pointer"
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)"
                }}
                onClick={handleFlip}
            >
                {/* FRONT */}
                <div
                    className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl p-8 flex flex-col justify-between"
                    style={{
                        backfaceVisibility: "hidden"
                    }}
                >
                    {/* Star */}
                    <div className="flex items-start justify-between">
                        <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">
                            {flashcard?.difficulty}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                flashcard.isStarred
                                    ? "bg-amber-400 text-white"
                                    : "bg-slate-100 text-slate-400"
                            }`}
                        >
                            <Star
                                className="w-4 h-4"
                                strokeWidth={2}
                                fill={
                                    flashcard.isStarred
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex items-center justify-center px-4 py-6">
                        <p className="text-lg font-semibold text-slate-900 text-center">
                            {flashcard.question}
                        </p>
                    </div>

                    {/* Hint */}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Click to reveal answer
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full bg-emerald-500 rounded-2xl p-8 flex flex-col justify-between"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}
                >
                    {/* Star */}
                    <div className="flex justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 text-white"
                        >
                            <Star
                                className="w-4 h-4"
                                strokeWidth={2}
                                fill={
                                    flashcard.isStarred
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    </div>

                    {/* Answer */}
                    <div className="flex-1 flex items-center justify-center px-4 py-6">
                        <p className="text-white text-center font-medium">
                            {flashcard.answer}
                        </p>
                    </div>

                    {/* Hint */}
                    <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Click to see question
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;