import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import { ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions"
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

const DocumentDetailPage = () => {
    const { id } = useParams();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Content");

    /* ---------------- FETCH DOCUMENT DATA ---------------- */
    useEffect(() => {
        const fetchDocumentDetails = async () => {
            try {
                const response = await documentService.getDocumentById(id);
                
                // Handle both object and array responses
                const docData = Array.isArray(response) ? response[0] : response;

                console.log("LOADED DOCUMENT:", docData);
                setDocument(docData);
            } catch (error) {
                toast.error("Failed to fetch document details.");
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDocumentDetails();
    }, [id]);

    /* ---------------- PDF URL GENERATOR ---------------- */
    const getPdfUrl = () => {
        if (!document?.fileUrl) return null;
        return `http://localhost:8000${document.fileUrl}`;
    };

    /* ---------------- TAB RENDERING FUNCTIONS ---------------- */
    
    const renderContent = () => {
        const pdfUrl = getPdfUrl();

        if (!pdfUrl) {
            return (
                <div className="text-center text-slate-500 py-10 italic">
                    PDF URL not found. Please re-upload the document.
                </div>
            );
        }

        return (
            <div className="bg-white border rounded-lg overflow-hidden shadow-md">
                <div className="flex items-center justify-between p-3 bg-slate-50 border-b">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Document Preview
                    </span>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800 transition-colors"
                    >
                        <ExternalLink size={14} />
                        Open Full PDF
                    </a>
                </div>

                <iframe
                    src={pdfUrl}
                    className="w-full h-[calc(100vh-250px)] border-none"
                    title="PDF Viewer"
                    onError={() => toast.error("Could not load PDF in viewer.")}
                />
            </div>
        );
    };

    const renderChat = () => {
        return <ChatInterface />;
    };

    const renderAIActions = () => {
        return <AIActions documentId={id} />;
    };

    const renderFlashcards = () => {
        return <FlashcardManager documentId={id} />;
    };

    const renderQuizzes = () => {
       return <QuizManager  documentId={id} />;
    };

    /* ---------------- MAIN RENDER LOGIC ---------------- */
    
    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Spinner />
        </div>
    );

    if (!document) {
        return (
            <div className="text-center p-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Document not found</h2>
                <Link to="/documents" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const tabs = [
       { name: "Content", label: "Content", content: renderContent },
       { name: "Chat", label: "Chat", content: renderChat },
       { name: "AI Actions", label: "AI Actions", content: renderAIActions },
       { name: "Flashcards", label: "Flashcards", content: renderFlashcards },
       { name: "Quizzes", label: "Quizzes", content: renderQuizzes },
    ];

    return (
        <div className="w-full min-h-screen bg-slate-50">
            {/* Header Section */}
            <div className="max-w-350 mx-auto px-6 pt-6">
                <div className="mb-4">
                    <Link to="/documents" className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                        ← Back to documents
                    </Link>
                </div>
                <PageHeader title={document.title} />
            </div>

            {/* Content Section */}
            <div className="max-w-400 mx-auto px-4 pb-8 mt-6">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
        </div>
    );
};

export default DocumentDetailPage;