import Flashcard from '../models/Flashcard.js';

// @desc    Get flashcards for a specific document
// @route   GET /api/flashcards/:documentId
export const getFlashcards = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: documentId  
        })
        .populate('documentId', 'title fileName') 
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all flashcard sets for a user
// @route   GET /api/flashcards
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user._id }) // Changed user to userId
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: flashcardSets.length, data: flashcardSets });
    } catch (error) { next(error); }
};

// @desc    Review a flashcard
export const reviewFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id // Changed user to userId
        });
        
        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;
        await flashcardSet.save();
        
        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard reviewed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle star status of a flashcard
// @route   PUT /api/flashcards/:cardId/star
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });
        
        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();
        
        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Star status toggled'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/flashcards/:id
export const deleteFlashcardSet = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found'
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};