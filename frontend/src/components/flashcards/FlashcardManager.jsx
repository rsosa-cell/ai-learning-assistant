import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Brain,
  Plus,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";

import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  /* ---------------- FETCH ---------------- */
  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);

      let actualSets = [];

      if (Array.isArray(response?.data)) {
        actualSets = response.data;
      } else if (Array.isArray(response)) {
        actualSets = response;
      }

      setFlashcardSets(actualSets || []);
    } catch (error) {
      console.error("Flashcard Fetch Error:", error);
      toast.error("Failed to load flashcards.");
      setFlashcardSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  /* ---------------- GENERATE ---------------- */
  const handleGenerateFlashcards = async () => {
    if (generating) return;

    setGenerating(true);

    try {
      await aiService.generateFlashCards(documentId);

      toast.success("Flashcards generated!");
      await fetchFlashcardSets();
    } catch (error) {
      console.error("Flashcard generation error:", error);

      toast.error(
        error?.message?.includes("503")
          ? "AI is busy. Please try again in a few seconds."
          : "Failed to generate flashcards."
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ---------------- NAVIGATION ---------------- */
  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards?.[index];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id);
    } catch (error) {
      console.error("Review failed:", error);
    }
  };

  const handleNextCard = () => {
    if (!selectedSet?.cards) return;

    handleReview(currentCardIndex);

    setCurrentCardIndex(
      (prev) => (prev + 1) % selectedSet.cards.length
    );
  };

  const handlePrevCard = () => {
    if (!selectedSet?.cards) return;

    handleReview(currentCardIndex);

    setCurrentCardIndex(
      (prev) =>
        (prev - 1 + selectedSet.cards.length) %
        selectedSet.cards.length
    );
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      const updatedSets = flashcardSets.map((set) => {
        if (selectedSet && set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId
              ? { ...card, isStarred: !card.isStarred }
              : card
          );
          return { ...set, cards: updatedCards };
        }
        return set;
      });

      setFlashcardSets(updatedSets);

      if (selectedSet) {
        setSelectedSet(
          updatedSets.find((s) => s._id === selectedSet._id)
        );
      }

      toast.success("Updated star status");
    } catch (error) {
      toast.error("Failed to update star status");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);

    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);

      toast.success("Deleted successfully");

      setIsDeleteModalOpen(false);
      setSetToDelete(null);

      await fetchFlashcardSets();
    } catch (error) {
      toast.error("Failed to delete set");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  /* ---------------- LOADING GENERATION ---------------- */
  if (generating) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-slate-500">
          Generating flashcards with AI...
        </p>
      </div>
    );
  }

  /* ---------------- VIEWER ---------------- */
  const renderFlashcardViewer = () => {
    const currentCard =
      selectedSet?.cards?.[currentCardIndex];

    if (!currentCard) {
      return (
        <div className="p-10 text-center text-slate-500">
          No flashcards found in this set.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSet(null)}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 hover:underline transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sets
        </button>

        <div className="flex flex-col items-center space-y-8 py-4">
          <div className="w-full max-w-2xl">
            <Flashcard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>

          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={handlePrevCard}
              className="flex items-center gap-1 px-3 py-2 rounded hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft />
              Previous
            </button>

            <span className="text-slate-600">
              {currentCardIndex + 1} /{" "}
              {selectedSet.cards.length}
            </span>

            <button
              onClick={handleNextCard}
              className="flex items-center gap-1 px-3 py-2 rounded hover:bg-slate-100 transition cursor-pointer"
            >
              Next
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- LIST ---------------- */
  const renderSetList = () => {
    if (loading) {
      return (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center py-20 text-center">
          <Brain className="w-10 h-10 text-emerald-600 mb-4" />

          <h3 className="text-xl font-bold">
            No Flashcards Yet
          </h3>

          <button
            onClick={handleGenerateFlashcards}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
          >
            <Plus />
            Generate Flashcards
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button
          onClick={handleGenerateFlashcards}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
        >
          <Sparkles />
          New Set
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="p-5 border rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition relative"
            >
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <h4>Study Set</h4>

              <p className="text-sm text-slate-500">
                {moment(set.createdAt).fromNow()}
              </p>

              <p>{set.cards?.length || 0} Cards</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------------- MAIN ---------------- */
  return (
    <div className="bg-white border rounded-xl p-6">
      {selectedSet
        ? renderFlashcardViewer()
        : renderSetList()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Set"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete this?
            <br />
            This cannot be recovered once deleted.
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="px-4 py-2 border rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardManager;