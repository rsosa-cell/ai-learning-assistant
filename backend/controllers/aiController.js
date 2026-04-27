import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// @desc    Generate flashcards from a document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        // ✅ ADDED: Guard clause to prevent 500 error if cards is not an array
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(422).json({
                success: false,
                error: 'AI failed to generate valid flashcards. Please try again.',
                statusCode: 422
            });
        }

        // ✅ Updated: Using documentId and userId to match your Flashcard.js model
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id, 
            cards: cards.map(card => ({
                question: card?.question || "No question provided",
                answer: card?.answer || "No answer provided",
                difficulty: card?.difficulty || 'medium'
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });

    } catch (error) {
        // ✅ ADDED: Detailed logging to see the actual error in your terminal
        console.error("Flashcard Gen Error:", error);

        if (error.message?.includes('quota') || error.status === 429) {
            error.statusCode = 429;
        }
        next(error);
    }
};

// @desc    Generate quiz from a document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // ✅ ADDED: Guard clause to prevent saving empty quizzes
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(422).json({
                success: false,
                error: 'AI failed to generate quiz questions.',
                statusCode: 422
            });
        }

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });

    } catch (error) {
        console.error("Quiz Gen Error:", error);
        if (error.message?.includes('quota') || error.status === 429) {
            error.statusCode = 429;
        }
        next(error);
    }
};

// @desc    Generate Summary
// @route   POST /api/ai/generate-summary
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });

    } catch (error) {
        if (error.message?.includes('quota') || error.status === 429) {
            error.statusCode = 429;
        }
        next(error);
    }
};

// @desc    Generate response for chat message
// @route   POST /api/ai/chat
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        const answer = await geminiService.chatWithContext(question, relevantChunks);

        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            }, {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated'
        });

    } catch (error) {
        if (error.message?.includes('quota') || error.status === 429) {
            error.statusCode = 429;
        }
        next(error);
    }
};

// @desc    Explain a specific concept
// @route   POST /api/ai/explain-concept
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });

    } catch (error) {
        if (error.message?.includes('quota') || error.status === 429) {
            error.statusCode = 429;
        }
        next(error);
    }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId,
        }).select('messages');

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No chat history found for this document'
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: 'Chat history retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};