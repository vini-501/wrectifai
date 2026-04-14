import { Router } from 'express';
import { getUIContent } from './ui-content.service';

export const uiContentRouter = Router();

uiContentRouter.get('/', async (req, res, next) => {
  try {
    const module = (req.query.module as string | undefined)?.trim();
    const page = (req.query.page as string | undefined)?.trim();
    const locale = (req.query.locale as string | undefined)?.trim() || 'en-US';
    const tenantId = (req.query.tenant_id as string | undefined)?.trim() || 'default';

    if (!module || !page) {
      return res.status(400).json({ message: 'module and page are required' });
    }

    const content = await getUIContent({
      tenantId,
      module,
      page,
      locale,
    });

    return res.json(content);
  } catch (error) {
    return next(error);
  }
});
