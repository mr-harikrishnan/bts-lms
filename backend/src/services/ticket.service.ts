import { Ticket, TicketStatus, TicketPriority } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { toObjectId } from '../utils/objectId.js';
import { ROLES } from '../constants/roles.js';
import { createTicketNotification } from './notification.service.js';

export async function createTicket(
  userId: string,
  payload: { subject: string; description: string; priority?: string }
) {
  const user = await User.findById(toObjectId(userId));
  if (!user) {
    const error: any = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Generate readable unique ticketId
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `TCK-${Date.now().toString().slice(-4)}${randomSuffix}`;

  const ticket = await Ticket.create({
    ticketId,
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    subject: payload.subject,
    description: payload.description,
    priority: (payload.priority as TicketPriority) || 'medium',
    status: 'open',
    replies: [],
  });

  return ticket;
}

export async function getLearnerTickets(userId: string) {
  const userOid = toObjectId(userId);
  return Ticket.find({ userId: userOid }).sort({ updatedAt: -1 });
}

export async function getTicketById(
  ticketRef: string,
  requestingUserId: string,
  requestingRole: string
) {
  // Query by either ticketId (e.g. TCK-...) or ObjectId
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(ticketRef);
  const query = isMongoId ? { _id: toObjectId(ticketRef) } : { ticketId: ticketRef };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error: any = new Error(`Ticket '${ticketRef}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // IDOR Protection: Student can only view their own ticket
  if (requestingRole !== ROLES.ADMIN && ticket.userId.toString() !== requestingUserId) {
    const error: any = new Error('Forbidden: You do not have permission to view this ticket.');
    error.statusCode = 403;
    throw error;
  }

  return ticket;
}

export async function addLearnerReply(
  ticketRef: string,
  userId: string,
  message: string
) {
  const user = await User.findById(toObjectId(userId));
  if (!user) {
    const error: any = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(ticketRef);
  const query = isMongoId ? { _id: toObjectId(ticketRef) } : { ticketId: ticketRef };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error: any = new Error(`Ticket '${ticketRef}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (ticket.userId.toString() !== userId) {
    const error: any = new Error('Forbidden: You can only reply to your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  ticket.replies.push({
    senderId: user._id,
    senderName: user.name,
    senderRole: 'student',
    message,
    createdAt: new Date(),
  });

  // Re-open if student replies to a resolved ticket
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    ticket.status = 'in_progress';
  }

  await ticket.save();
  return ticket;
}

export async function getAllTicketsAdmin(statusFilter?: string) {
  const query: Record<string, any> = {};
  if (statusFilter && statusFilter !== 'all') {
    query.status = statusFilter;
  }

  return Ticket.find(query).sort({ updatedAt: -1 });
}

export async function addAdminReply(
  ticketRef: string,
  adminId: string,
  message: string
) {
  const admin = await User.findById(toObjectId(adminId));
  if (!admin) {
    const error: any = new Error('Administrator not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(ticketRef);
  const query = isMongoId ? { _id: toObjectId(ticketRef) } : { ticketId: ticketRef };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error: any = new Error(`Ticket '${ticketRef}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  ticket.replies.push({
    senderId: admin._id,
    senderName: admin.name || 'DLABS Support Administrator',
    senderRole: 'admin',
    message,
    createdAt: new Date(),
  });

  if (ticket.status === 'open') {
    ticket.status = 'in_progress';
  }

  await ticket.save();

  // Send automated notification to learner
  await createTicketNotification(
    ticket.userId.toString(),
    ticket.ticketId,
    ticket.subject,
    message
  );

  return ticket;
}

export async function updateTicketStatus(
  ticketRef: string,
  newStatus: TicketStatus
) {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(ticketRef);
  const query = isMongoId ? { _id: toObjectId(ticketRef) } : { ticketId: ticketRef };

  const ticket = await Ticket.findOne(query);
  if (!ticket) {
    const error: any = new Error(`Ticket '${ticketRef}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  ticket.status = newStatus;
  if (newStatus === 'closed' || newStatus === 'resolved') {
    ticket.closedAt = new Date();
  } else {
    ticket.closedAt = null;
  }

  await ticket.save();
  return ticket;
}
