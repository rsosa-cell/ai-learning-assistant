import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../services/quizService";
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button'

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await quizService.getQuizById(quizId);
                // Handle both response structures { success: true, data: {} } or just {}
                const quizData = response.data || response;
                setQuiz(quizData);
            } catch (error) {
                toast.error('Failed to fetch quiz');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleOptionChange = (questionId, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

const handleSubmitQuiz = async () => {
    // 1. Validation check
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < quiz.questions.length) {
        if (!window.confirm(`You've only answered ${answeredCount}/${quiz.questions.length} questions. Submit anyway?`)) {
            return;
        }
    }

    try {
        setSubmitting(true);

        // ✅ REFORMATTING: Convert your state into the "answers" array
        const answersPayload = quiz.questions.map((q, index) => {
            const selectedOptionIndex = selectedAnswers[q._id];
            
            return {
                questionIndex: index,
                selectedAnswer: q.options[selectedOptionIndex] || "" 
            };
        });

        const response = await quizService.submitQuiz(quizId, { 
            answers: answersPayload 
        });
        
        if (response.success || response) {
            toast.success('Quiz submitted!');
            navigate(`/quizzes/${quizId}/results`);
        }
    } catch (error) {
        // Extract the error message from the response if available
        const errorMsg = error.response?.data?.error || error.message || 'Failed to submit quiz';
        toast.error(errorMsg);
        console.error('Submission Error:', error);
    } finally {
        setSubmitting(false);
    }
};
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner />
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">Quiz not found or has no questions.</p>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <PageHeader title={quiz.title || 'Take Quiz'} />
            
            {/* BACK BUTTON ADDED HERE */}
            <div className="mb-6 -mt-4">
                <Link

                to={`/documents/${quiz.documentId?._id || quiz.documentId}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors duration-200"
                >
                <ChevronLeft className="w-4 h-4" />
                     Back to Document
            </Link>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-emerald-500 h-full transition-all duration-300" 
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-8">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-4 mb-10">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestion._id] === index;

                        return (
                            <label 
                                key={index}
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                }`}
                            >
                                <input 
                                    type="radio"
                                    name={`question-${currentQuestion._id}`}
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() => handleOptionChange(currentQuestion._id, index)}
                                />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                    isSelected ? 'border-emerald-500' : 'border-slate-300'
                                }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                </div>

                                <span className={`flex-1 text-lg ${isSelected ? 'text-emerald-900 font-medium' : 'text-slate-700'}`}>
                                    {option}
                                </span>

                                {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />
                                )}
                            </label>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between min-h-12 border-t border-slate-50 pt-8">
                    <div>
                        {currentQuestionIndex > 0 && (
                            <Button 
                                onClick={handlePreviousQuestion} 
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Previous
                            </Button>
                        )}
                    </div>

                    <div>
                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <Button 
                                onClick={handleSubmitQuiz} 
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleNextQuestion}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizTakePage;