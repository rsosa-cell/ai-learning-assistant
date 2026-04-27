import React, { useState, useEffect} from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Plus, 
    ChevronLeft,
    ChevronRight,
    Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashCardPage = () => {
    const { id: documentId } = useParams();
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchFlashcards = async () => {
        setLoading(true);
        try{
            const response = await flashcardService.getFlashcardsForDocument(
                documentId
            );
            // Handling potential array or object response from your service
            const data = response.data?.[0] || response[0];
            setFlashcardSets(data);
            setFlashcards(data?.cards || []);
        } catch (error){
            toast.error("Failed to fetch cards.");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    useEffect (() => {
        if (documentId && documentId !== 'null') {
        fetchFlashcards();
    } else {
        setLoading(false);
    }
}, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try{
            await aiService.generateFlashCards(documentId);
            toast.success("Flashcards generated successfully!!!");
            fetchFlashcards();
        } catch (error){
            toast.error(error.message || "Failed to generate flashcards");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        handleReview(currentCardIndex)
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrevCard = () => {
        handleReview(currentCardIndex)
        setCurrentCardIndex(
            (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
        );
    };

    const handleReview = async (index) => {
        const currentCard = flashcards[index]; // Use the passed index for accuracy
        if (!currentCard) return;

        try{
            await flashcardService.reviewFlashcard(currentCard._id, index);
            // Optional: toast.success("Flashcard reviewed!") // Keep quiet for better UX if preferred
        } catch (error){
            console.error("Review failed", error);
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            setFlashcards((prevFlashcards) =>
                prevFlashcards.map((card) => 
                    card._id === cardId ? { ...card, isStarred : !card.isStarred } : card
                )
            );
            toast.success("Status updated!");
        } catch (error){
            toast.error("Failed to update star status")
        }
    };

    const handleDeleteFlashcardSet = async () => {
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(flashcardSets._id);
            toast.success("Flashcard set deleted successfully!");
            setIsDeleteModalOpen(false);
            // Reset state after deletion
            setFlashcards([]);
            setFlashcardSets(null);
        } catch (error){
            toast.error(error.message || "Failed to delete flashcard set.")
        } finally {
            setDeleting(false)
        }
    };

    const renderFlashcardContent = () => {
        if(loading){
            return <Spinner/>
        }

        if (flashcards.length === 0){
            return (
                <EmptyState 
                    title="No Flashcards Yet"
                    description="Generate flashcards from your document to start learning."
                />
            );
        }

        const currentCard = flashcards[currentCardIndex];
        
        return (
            <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-md">
                    <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
                </div>
                <div className="flex items-center gap-4">
                    <Button
                      onClick={handlePrevCard}
                      variant="secondary"
                      disabled={flashcards.length <= 1}
                    >
                        <ChevronLeft size={16} /> Previous
                    </Button>
                    <span className="text-sm text-neutral-600 font-medium">
                        {currentCardIndex + 1} / {flashcards.length}
                    </span>
                    <Button
                        onClick={handleNextCard}
                        variant="secondary"
                        disabled={flashcards.length <= 1}
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        )
    }


    return (
        <div>
            <div className="mb-4">
                <Link 
                    to={`/documents/${documentId}`}
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Document
                </Link>
            </div>
            <PageHeader title= "Flashcards">
                <div className="flex gap-2">
                    {!loading &&
                        (flashcards.length > 0 ? (
                            <Button 
                                onClick={() => setIsDeleteModalOpen(true)}
                                disabled={deleting}
                                variant="danger" // Assuming you have a danger variant for red
                            >
                                <Trash2 size={16} /> Delete Set
                            </Button>
                        ): (
                            <Button onClick={handleGenerateFlashcards} disabled={generating}>
                            {generating ? (
                                <>
                                    <Spinner /> Generating...
                                </>
                            ):(
                                <>
                                    <Plus size={16}/> Generate Flashcards
                                </>
                            )}
                            </Button>
                        ))}
                </div>
            </PageHeader>
            
            <div className="py-8">
                {renderFlashcardContent()}
            </div>
            
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete Flashcard Set"
            >
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        Are you sure you want to delete all flashcards for this document? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button 
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteFlashcardSet}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
export default FlashCardPage;