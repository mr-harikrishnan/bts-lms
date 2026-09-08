import { Router } from 'express';
import * as certificateController from '../../controllers/certificate.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateObjectIdParam } from '../../middleware/validation.middleware.js';

const router = Router();

router.get('/', requireAuth, certificateController.getUserCertificates);
router.get('/:certificateId', requireAuth, validateObjectIdParam('certificateId'), certificateController.getCertificateById);
router.post('/generate', requireAuth, certificateController.generate);

export default router;
