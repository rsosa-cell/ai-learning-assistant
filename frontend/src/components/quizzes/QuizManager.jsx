import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import Modal from "../common/Modal";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

const QuizManager = ({ documentId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    /* ---------------- FETCH ---------------- */
    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(response?.data || []);
        } catch (error) {
            toast.error("Failed to fetch quizzes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) fetchQuizzes();
    }, [documentId]);

    /* ---------------- GENERATE ---------------- */
    const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
        await aiService.generateQuiz(documentId, { numQuestions });

        toast.success("Quiz generated!");

        setIsGenerateModalOpen(false);

        await fetchQuizzes(); // ✅ wait for it
    } catch (error) {
        toast.error(error.message || "Failed to generate quiz.");
    } finally {
        setGenerating(false); // ✅ ALWAYS stops loading
    }
};

    /* ---------------- DELETE ---------------- */
    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return;

        setDeleting(true);
        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success("Quiz deleted");

            setQuizzes((prev) =>
                prev.filter((q) => q._id !== selectedQuiz._id)
            );

            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
        } catch (error) {
            toast.error("Failed to delete quiz.");
        } finally {
            setDeleting(false);
        }
    };

    /* ---------------- RENDER ---------------- */
    const renderQuizContent = () => {
        if (loading) return <Spinner />;

        if (quizzes.length === 0) {
            return (
                <EmptyState
                    title="No Quizzes Yet"
                    description="Generate a quiz from your document"
                />
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {quizzes.map((quiz) => (
                    <QuizCard
                        key={quiz._id}
                        quiz={quiz}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white border rounded-lg p-6">

            {/* HEADER */}
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsGenerateModalOpen(true)}>
                    Generate Quiz
                </Button>
            </div>

            {renderQuizContent()}

            {/* GENERATE MODAL */}
            <Modal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title="Generate New Quiz"
            >
                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                    <input
                        type="number"
                        value={numQuestions}
                        min="1"
                        onChange={(e) =>
                            setNumQuestions(
                                Math.max(1, parseInt(e.target.value) || 1)
                            )
                        }
                        className="w-full border rounded p-2"
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={() => setIsGenerateModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            {generating ? "Generating..." : "Generate"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Quiz?"
            >
                <div className="space-y-4">
                    <p>
                        Delete{" "}
                        <strong>
                            {selectedQuiz?.title || "this quiz"}
                        </strong>
                        ?
                    </p>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>

                        <Button onClick={handleConfirmDelete}>
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QuizManager;