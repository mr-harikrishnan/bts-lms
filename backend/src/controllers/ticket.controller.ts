import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticket.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

// ==========================================
// Learner Controllers
// ==========================================

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.createTicket(req.user!._id.toString(), req.body);
    apiSuccess(res, ticket, 201, 'Support ticket created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await ticketService.getLearnerTickets(req.user!._id.toString());
    apiSuccess(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function getTicketDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketService.getTicketById(
      req.params.id as string,
      req.user!._id.toString(),
      req.user!.role
    );
    apiSuccess(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function replyToTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message } = req.body;
    const ticket = await ticketService.addLearnerReply(
      req.params.id as string,
      req.user!._id.toString(),
      message
    );
    apiSuccess(res, ticket, 200, 'Reply sent successfully.');
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Admin Controllers
// ==========================================

export async function getAdminTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const tickets = await ticketService.getAllTicketsAdmin(status);
    apiSuccess(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function replyAsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message } = req.body;
    const ticket = await ticketService.addAdminReply(
      req.params.id as string,
      req.user!._id.toString(),
      message
    );
    apiSuccess(res, ticket, 200, 'Administrator reply dispatched.');
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const ticket = await ticketService.updateTicketStatus(req.params.id as string, status);
    apiSuccess(res, ticket, 200, 'Ticket status updated.');
  } catch (error) {
    next(error);
  }
}
