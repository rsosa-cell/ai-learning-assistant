import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ✅ Added 's' to match component: getFlashcardsForDocument
const getFlashcardsForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch flashcards' }
    }
};

const getAllFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
        return response.data?.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch flashcard sets' }
    }
};

// ✅ Usually reviews should be POST or PATCH, not GET
const reviewFlashcard = async (cardId, cardIndex) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId), { cardIndex });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to review flashcards' }
    }
};

const toggleStar = async (cardId) => {
    try {
        const response = await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to star card' }
    }
};

// ✅ Fixed typo in function name: deleteFlashcardSet
const deleteFlashcardSet = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete set' }
    }
};

const flashcardService = {
    getAllFlashcardSets,
    getFlashcardsForDocument, // ✅ Name updated
    reviewFlashcard,
    toggleStar,
    deleteFlashcardSet,      // ✅ Name updated
};

export default flashcardService;