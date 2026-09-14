import { Router } from 'express';
import * as ticketController from '../../controllers/ticket.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import { validateTicketCreate, validateTicketReply } from '../../validators/ticket.validator.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(validateTicketCreate), ticketController.createTicket);
router.get('/', ticketController.getMyTickets);
router.get('/:id', ticketController.getTicketDetails);
router.post('/:id/reply', validateBody(validateTicketReply), ticketController.replyToTicket);

export default router;
