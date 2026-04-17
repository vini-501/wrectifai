import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { query } from '../../db/postgres';
import crypto from 'node:crypto';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

usersRouter.get('/user/dashboard', requireAuth, requireRole('user'), (_req, res) => {
  res.json({ role: 'user', message: 'User dashboard data' });
});

usersRouter.get('/garage/dashboard', requireAuth, requireRole('garage'), (_req, res) => {
  res.json({ role: 'garage', message: 'Garage dashboard data' });
});

usersRouter.get('/vendor/dashboard', requireAuth, requireRole('vendor'), (_req, res) => {
  res.json({ role: 'vendor', message: 'Vendor dashboard data' });
});

usersRouter.get('/admin/dashboard', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ role: 'admin', message: 'Admin dashboard data' });
});

usersRouter.get('/profile', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const result = await query<{
      full_name: string;
      email: string | null;
      phone: string;
      avatar_url: string | null;
      bio: string | null;
      address_line: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      notification_preferences: Record<string, unknown> | null;
    }>(
      `
        SELECT
          u.full_name,
          u.email,
          u.phone,
          p.avatar_url,
          p.bio,
          p.address_line,
          p.city,
          p.state,
          p.postal_code,
          p.notification_preferences
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    const profile = result.rows[0];
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json({
      profile: {
        fullName: profile.full_name,
        email: profile.email ?? '',
        phone: profile.phone,
        avatarUrl: profile.avatar_url ?? '',
        bio: profile.bio ?? '',
        addressLine: profile.address_line ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        postalCode: profile.postal_code ?? '',
        notificationPreferences: profile.notification_preferences ?? {
          bookings: true,
          reminders: true,
          offers: true,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

usersRouter.put('/profile', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const {
      fullName,
      email,
      avatarUrl,
      bio,
      addressLine,
      city,
      state,
      postalCode,
      notificationPreferences,
    } = req.body as {
      fullName?: string;
      email?: string;
      avatarUrl?: string;
      bio?: string;
      addressLine?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      notificationPreferences?: Record<string, unknown>;
    };

    if (!fullName?.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    const normalizedEmail = email?.trim() ? email.trim().toLowerCase() : null;

    await query(
      `
        UPDATE users
        SET full_name = $2, email = $3, updated_at = NOW()
        WHERE id = $1
      `,
      [userId, fullName.trim(), normalizedEmail]
    );

    await query(
      `
        INSERT INTO profiles (
          id, user_id, avatar_url, bio, address_line, city, state, postal_code, notification_preferences
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (user_id)
        DO UPDATE SET
          avatar_url = EXCLUDED.avatar_url,
          bio = EXCLUDED.bio,
          address_line = EXCLUDED.address_line,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          postal_code = EXCLUDED.postal_code,
          notification_preferences = EXCLUDED.notification_preferences,
          updated_at = NOW()
      `,
      [
        crypto.randomUUID(),
        userId,
        avatarUrl?.trim() || null,
        bio?.trim() || null,
        addressLine?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        postalCode?.trim() || null,
        JSON.stringify(
          notificationPreferences ?? {
            bookings: true,
            reminders: true,
            offers: true,
          }
        ),
      ]
    );

    return res.json({ message: 'Profile saved successfully' });
  } catch (error) {
    return next(error);
  }
});

usersRouter.get('/settings', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const result = await query<{ notification_preferences: Record<string, unknown> | null }>(
      `SELECT notification_preferences FROM profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    return res.json({
      settings: result.rows[0]?.notification_preferences ?? {
        bookings: true,
        reminders: true,
        offers: true,
        preferredCheckinMode: 'self_checkin',
      },
    });
  } catch (error) {
    return next(error);
  }
});

usersRouter.put('/settings', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const settings = (req.body as { settings?: Record<string, unknown> }).settings ?? {};

    await query(
      `
        INSERT INTO profiles (id, user_id, notification_preferences)
        VALUES ($1, $2, $3::jsonb)
        ON CONFLICT (user_id)
        DO UPDATE SET
          notification_preferences = $3::jsonb,
          updated_at = NOW()
      `,
      [crypto.randomUUID(), userId, JSON.stringify(settings)]
    );

    return res.json({ message: 'Settings updated' });
  } catch (error) {
    return next(error);
  }
});

usersRouter.get('/support-tickets', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const rows = await query<{
      id: string;
      subject: string;
      description: string;
      status: string;
      created_at: Date;
    }>(
      `
        SELECT id, subject, description, status, created_at
        FROM support_tickets
        WHERE customer_user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      tickets: rows.rows.map((row) => ({
        id: row.id,
        subject: row.subject,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

usersRouter.post('/support-tickets', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const body = req.body as { subject?: string; description?: string };
    const subject = body.subject?.trim();
    const description = body.description?.trim();
    if (!subject || !description) {
      return res.status(400).json({ message: 'subject and description are required' });
    }

    const id = crypto.randomUUID();
    await query(
      `
        INSERT INTO support_tickets (id, customer_user_id, subject, description, status)
        VALUES ($1,$2,$3,$4,'open')
      `,
      [id, userId, subject, description]
    );

    return res.status(201).json({ message: 'Support ticket created', ticketId: id });
  } catch (error) {
    return next(error);
  }
});

// Get user's issue requests with quotes
usersRouter.get('/issue-requests-with-quotes', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    
    const result = await query(`
      SELECT 
        ir.id,
        ir.customer_user_id,
        ir.vehicle_id,
        ir.summary,
        ir.status,
        ir.created_at,
        CONCAT(v.make, ' ', v.model, ' ', v.year) as vehicle_label
      FROM issue_requests ir
      JOIN vehicles v ON ir.vehicle_id = v.id
      WHERE ir.customer_user_id = $1::uuid
      ORDER BY ir.created_at DESC
    `, [userId]);

    const issueRequests = await Promise.all(result.rows.map(async (ir) => {
      const quotesResult = await query(`
        SELECT 
          q.id,
          q.issue_request_id,
          q.garage_id,
          COALESCE(g.business_name, 'Garage Quote') as garage_name,
          g.trust_score as garage_rating,
          q.parts_cost,
          q.labor_cost,
          q.total_cost,
          q.eta_note as description,
          q.comparison_label,
          q.status,
          q.created_at
        FROM quotes q
        LEFT JOIN garages g ON q.garage_id = g.id
        WHERE q.issue_request_id = $1::uuid
        ORDER BY q.created_at ASC
      `, [ir.id]);

      return {
        ...ir,
        quotes: quotesResult.rows,
      };
    }));

    return res.json({ issue_requests: issueRequests });
  } catch (error) {
    return next(error);
  }
});

// Accept a quote
usersRouter.post('/quotes/:quoteId/accept', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const userId = req.authUser!.userId;
    const { quoteId } = req.params;

    // Get the quote and issue request
    const quoteResult = await query(`
      SELECT q.id, q.issue_request_id, q.garage_id, ir.customer_user_id
      FROM quotes q
      JOIN issue_requests ir ON q.issue_request_id = ir.id
      WHERE q.id = $1::uuid
    `, [quoteId]);

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const quote = quoteResult.rows[0];
    
    // Verify the quote belongs to the user's issue request
    if (quote.customer_user_id !== userId) {
      return res.status(403).json({ message: 'You can only accept quotes for your own issue requests' });
    }

    // Update quote status to accepted
    await query(`
      UPDATE quotes
      SET status = 'accepted'
      WHERE id = $1::uuid
    `, [quoteId]);

    // Update issue request status
    await query(`
      UPDATE issue_requests
      SET status = 'quote_accepted'
      WHERE id = $1::uuid
    `, [quote.issue_request_id]);

    // Reject all other quotes for this issue request
    await query(`
      UPDATE quotes
      SET status = 'rejected'
      WHERE issue_request_id = $1::uuid AND id != $2::uuid
    `, [quote.issue_request_id, quoteId]);

    return res.json({ message: 'Quote accepted successfully' });
  } catch (error) {
    return next(error);
  }
});
