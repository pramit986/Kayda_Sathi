// ============================================================
// Kayda Sathi — Case Controller
// ============================================================

import { Request, Response } from 'express';
import { CaseService } from '../services/caseService';
import { ApiResponse } from '../types';

export const createCase = async (req: Request, res: Response) => {
  try {
    const { description, inputType = 'TEXT', language = 'en', userId } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Description is required and must be at least 5 characters long.',
      });
    }

    const result = await CaseService.createCaseFromStory({
      description: description.trim(),
      inputType,
      language,
      userId,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Case successfully created and analyzed by AI.',
    };

    return res.status(201).json(response);
  } catch (err: any) {
    console.error('Error creating case:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while creating case',
    });
  }
};

export const getCases = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const cases = await CaseService.listCases(userId);

    return res.json({
      success: true,
      data: cases,
    });
  } catch (err: any) {
    console.error('Error fetching cases:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while listing cases',
    });
  }
};

export const getCaseById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const foundCase = await CaseService.getCase(id);

    if (!foundCase) {
      return res.status(404).json({
        success: false,
        error: `Case ${id} not found`,
      });
    }

    const intakeQuestions = CaseService.getIntakeQuestions(id);

    return res.json({
      success: true,
      data: {
        case: foundCase,
        intakeQuestions,
      },
    });
  } catch (err: any) {
    console.error(`Error fetching case ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while getting case',
    });
  }
};

export const submitIntakeAnswers = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be an array of { questionId, answer }',
      });
    }

    const updatedCase = await CaseService.answerIntakeQuestions(id, answers);

    return res.json({
      success: true,
      data: updatedCase,
      message: 'Intake answers processed and case updated.',
    });
  } catch (err: any) {
    console.error(`Error submitting intake for case ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error processing intake answers',
    });
  }
};

export const updateActionItemStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const actionId = String(req.params.actionId);
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be TODO, IN_PROGRESS, or DONE',
      });
    }

    const updatedCase = await CaseService.updateActionItem(id, actionId, status);

    return res.json({
      success: true,
      data: updatedCase,
    });
  } catch (err: any) {
    console.error('Error updating action item:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error updating action item',
    });
  }
};

export const generateDocument = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Document type is required (e.g. REFUND_REQUEST, COMPLAINT, LAWYER_BRIEF)',
      });
    }

    const document = await CaseService.generateDocument(id, type);

    return res.json({
      success: true,
      data: document,
      message: 'Legal document drafted successfully.',
    });
  } catch (err: any) {
    console.error('Error generating document:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error generating legal document',
    });
  }
};

export const deleteCase = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await CaseService.deleteCase(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Case ${id} not found`,
      });
    }

    return res.json({
      success: true,
      message: `Case ${id} successfully deleted`,
    });
  } catch (err: any) {
    console.error('Error deleting case:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error deleting case',
    });
  }
};
