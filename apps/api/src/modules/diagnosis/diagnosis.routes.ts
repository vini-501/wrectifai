import crypto from 'node:crypto';
import { Router } from 'express';
import { query } from '../../db/postgres';
import { requireAuth, requireRole } from '../auth/auth.middleware';

export const diagnosisRouter = Router();

diagnosisRouter.use(requireAuth, requireRole('user'));

type DynamicQuestion = {
  id: string;
  type: 'single_select' | 'boolean' | 'text' | 'file';
  label: string;
  options?: string[];
  required: boolean;
};

function normalizeQuestionId(label: string, index: number) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return (base || `question_${index + 1}`).slice(0, 40);
}

function sanitizeQuestions(input: unknown): DynamicQuestion[] {
  if (!Array.isArray(input)) return [];
  const questions: DynamicQuestion[] = [];

  for (let index = 0; index < input.length; index += 1) {
    const entry = input[index];
    if (!entry || typeof entry !== 'object') continue;

    const value = entry as Record<string, unknown>;
    const label = typeof value.label === 'string' ? value.label.trim() : '';
    const rawType = typeof value.type === 'string' ? value.type.trim() : 'text';
    const type: DynamicQuestion['type'] =
      rawType === 'single_select' || rawType === 'boolean' || rawType === 'file' ? rawType : 'text';
    const options =
      Array.isArray(value.options) && type === 'single_select'
        ? value.options
            .filter((option): option is string => typeof option === 'string')
            .map((option) => option.trim())
            .filter(Boolean)
            .slice(0, 5)
        : undefined;
    const required = value.required !== false;

    if (!label) continue;
    if (type === 'single_select' && (!options || options.length < 2)) continue;

    questions.push({
      id:
        typeof value.id === 'string' && value.id.trim()
          ? value.id.trim()
          : normalizeQuestionId(label, index),
      type,
      label,
      ...(options ? { options } : {}),
      required,
    });

    if (questions.length >= 6) break;
  }

  return questions;
}

function fallbackQuestions(category: string, firstAnswer: string): DynamicQuestion[] {
  const categoryLabel = category || 'vehicle';
  const issueText = firstAnswer.toLowerCase();

  if (
    issueText.includes('glass') ||
    issueText.includes('window') ||
    issueText.includes('windshield') ||
    issueText.includes('windscreen')
  ) {
    return [
      {
        id: 'glass_side',
        type: 'single_select',
        label: 'Which glass is damaged?',
        options: ['Front windshield', 'Rear windshield', 'Left window', 'Right window'],
        required: true,
      },
      {
        id: 'damage_size',
        type: 'single_select',
        label: 'How severe is the damage?',
        options: ['Small crack/chip', 'Medium crack', 'Large crack', 'Shattered'],
        required: true,
      },
      {
        id: 'visibility_blocked',
        type: 'boolean',
        label: 'Is your driving visibility affected?',
        required: true,
      },
      {
        id: 'water_leak',
        type: 'boolean',
        label: 'Is there any water leakage from that area?',
        required: false,
      },
      {
        id: 'door_window_operates',
        type: 'single_select',
        label: 'If it is a side window, does it roll up/down normally?',
        options: ['Works normally', 'Slow/stuck', 'Not working', 'Not applicable'],
        required: false,
      },
    ];
  }

  if (categoryLabel === 'battery') {
    return [
      {
        id: 'start_behavior',
        type: 'single_select',
        label: 'What happens when you try to start the vehicle?',
        options: ['Starts normally', 'Slow crank', 'Clicking sound', 'Does not start'],
        required: true,
      },
      {
        id: 'dashboard_lights',
        type: 'single_select',
        label: 'How are the dashboard/head lights behaving?',
        options: ['Normal brightness', 'Dim', 'Flickering', 'Not turning on'],
        required: true,
      },
      {
        id: 'recent_jump_start',
        type: 'boolean',
        label: 'Did you need a jump-start recently?',
        required: false,
      },
      {
        id: 'battery_age_band',
        type: 'single_select',
        label: 'Approximate battery age?',
        options: ['Less than 1 year', '1-2 years', '2-3 years', 'More than 3 years'],
        required: true,
      },
    ];
  }

  if (categoryLabel === 'brake') {
    return [
      {
        id: 'brake_response',
        type: 'single_select',
        label: 'How do the brakes feel?',
        options: ['Normal', 'Soft/spongy', 'Hard pedal', 'Poor stopping'],
        required: true,
      },
      {
        id: 'brake_noise',
        type: 'single_select',
        label: 'Do you hear any brake noise?',
        options: ['No noise', 'Squealing', 'Grinding', 'Knocking'],
        required: true,
      },
      {
        id: 'brake_vibration',
        type: 'boolean',
        label: 'Do you feel vibration while braking?',
        required: false,
      },
      {
        id: 'warning_light',
        type: 'boolean',
        label: 'Is the brake warning/ABS light on?',
        required: false,
      },
    ];
  }

  if (categoryLabel === 'ac') {
    return [
      {
        id: 'ac_cooling_level',
        type: 'single_select',
        label: 'How is the cooling performance?',
        options: ['Normal', 'Low cooling', 'No cooling'],
        required: true,
      },
      {
        id: 'ac_noise',
        type: 'boolean',
        label: 'Any unusual noise when AC is ON?',
        required: false,
      },
      {
        id: 'ac_odor',
        type: 'boolean',
        label: 'Any bad smell from vents?',
        required: false,
      },
      {
        id: 'cooling_condition',
        type: 'single_select',
        label: 'When is cooling weakest?',
        options: ['At idle', 'While driving', 'In hot afternoons', 'Always weak'],
        required: false,
      },
    ];
  }

  if (categoryLabel === 'tyre') {
    return [
      {
        id: 'air_loss_speed',
        type: 'single_select',
        label: 'How quickly is air pressure dropping?',
        options: ['No air loss', 'Slow leak', 'Fast leak', 'Flat immediately'],
        required: true,
      },
      {
        id: 'visible_damage',
        type: 'single_select',
        label: 'What visible tyre damage do you see?',
        options: ['No visible damage', 'Nail/puncture', 'Sidewall cut', 'Uneven wear'],
        required: true,
      },
      {
        id: 'driving_stability',
        type: 'boolean',
        label: 'Is vehicle stability affected while driving?',
        required: false,
      },
      {
        id: 'recent_tyre_change',
        type: 'boolean',
        label: 'Were tyres recently changed or repaired?',
        required: false,
      },
    ];
  }

  if (categoryLabel === 'engine') {
    return [
      {
        id: 'engine_when_occurs',
        type: 'single_select',
        label: 'When does the engine issue appear most?',
        options: ['Starting', 'Idling', 'Accelerating', 'While cruising'],
        required: true,
      },
      {
        id: 'engine_noise_type',
        type: 'single_select',
        label: 'Any unusual engine sound?',
        options: ['No', 'Ticking', 'Knocking', 'Rattling'],
        required: false,
      },
      {
        id: 'smoke_color',
        type: 'single_select',
        label: 'Any smoke from exhaust?',
        options: ['No smoke', 'White smoke', 'Black smoke', 'Blue smoke'],
        required: false,
      },
      {
        id: 'power_drop',
        type: 'boolean',
        label: 'Do you feel power loss while driving?',
        required: true,
      },
    ];
  }

  if (categoryLabel === 'electrical') {
    return [
      {
        id: 'electrical_components',
        type: 'single_select',
        label: 'Which electrical item is failing?',
        options: ['Headlights', 'Power windows', 'Infotainment', 'Multiple items'],
        required: true,
      },
      {
        id: 'failure_pattern',
        type: 'single_select',
        label: 'How does the failure occur?',
        options: ['Intermittent', 'Always off', 'Works after restart', 'Flickers'],
        required: true,
      },
      {
        id: 'fuse_checked',
        type: 'boolean',
        label: 'Have you checked fuses recently?',
        required: false,
      },
      {
        id: 'burn_smell',
        type: 'boolean',
        label: 'Any burnt smell near dashboard/controls?',
        required: false,
      },
    ];
  }

  return [
    {
      id: 'affected_area',
      type: 'text',
      label: `Which exact ${categoryLabel} component is affected?`,
      required: true,
    },
    {
      id: 'frequency',
      type: 'single_select',
      label: 'How often does this issue occur?',
      options: ['Always', 'Often', 'Sometimes', 'Only once/twice'],
      required: true,
    },
    {
      id: 'symptom_pattern',
      type: 'text',
      label: 'What exact symptom do you notice most often?',
      required: true,
    },
    {
      id: 'warning_indicator',
      type: 'boolean',
      label: 'Any warning light or alert visible?',
      required: true,
    },
    {
      id: 'recent_service',
      type: 'boolean',
      label: 'Was any related service done recently?',
      required: false,
    },
  ];
}

function parseGeminiJson(text: string): { questions?: unknown } {
  const trimmed = text.trim();
  if (!trimmed) return {};

  // Common case: clean JSON body
  try {
    return JSON.parse(trimmed) as { questions?: unknown };
  } catch {
    // continue
  }

  // Handle markdown fenced blocks
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1]) as { questions?: unknown };
    } catch {
      // continue
    }
  }

  // Handle extra text around JSON
  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) {
    const slice = trimmed.slice(objectStart, objectEnd + 1);
    try {
      return JSON.parse(slice) as { questions?: unknown };
    } catch {
      // continue
    }
  }

  return {};
}

function extractQuestionsPayload(parsed: unknown): unknown {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const value = parsed as Record<string, unknown>;
    if (Array.isArray(value.questions)) return value.questions;
    if (value.data && typeof value.data === 'object') {
      const nested = value.data as Record<string, unknown>;
      if (Array.isArray(nested.questions)) return nested.questions;
    }
  }
  return undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGeminiQuestions(input: {
  endpoint: string;
  prompt: string;
  retries: number;
}) {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= input.retries) {
    const response = await fetch(input.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
        },
        contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      }),
    });

    if (response.ok) {
      return (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
    }

    const message = await response.text();
    const retriable = response.status === 429 || response.status === 503;
    lastError = new Error(`Gemini request failed: ${response.status} ${message}`);

    if (!retriable || attempt === input.retries) {
      throw lastError;
    }

    const delayMs = 500 * 2 ** attempt;
    await sleep(delayMs);
    attempt += 1;
  }

  throw lastError ?? new Error('Gemini request failed');
}

async function generateGeminiQuestions(input: {
  prompt: string;
  firstAnswer: string;
  category?: string;
  mode?: 'diagnosis' | 'direct';
  maxQuestions?: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const primaryModel = (process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash').replace(/^models\//, '');
  const backupModel = (process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-2.0-flash').replace(/^models\//, '');
  const models = Array.from(new Set([primaryModel, backupModel]));
  const retries = Number(process.env.GEMINI_RETRIES ?? 2);

  const questionLimit = Math.max(3, Math.min(Number(input.maxQuestions ?? 6), 6));
  const prompt = [
    input.prompt.trim(),
    `Mode: ${input.mode ?? 'diagnosis'}`,
    `Category: ${input.category ?? 'unknown'}`,
    `User first issue answer: ${input.firstAnswer.trim()}`,
    'Ask only context-specific diagnostic questions for this exact issue.',
    'Do not use generic templates like "when does issue happen" unless strictly relevant.',
    'If issue mentions broken glass/window/windshield, ask side/location and crack/shatter severity.',
    'Output schema: {"questions":[{"id":"...", "type":"single_select|boolean|text", "label":"...", "options":["..."], "required":true}]}.',
    `Return ${questionLimit} questions in JSON only.`,
  ].join('\n');

  let finalError: Error | null = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const data = await requestGeminiQuestions({ endpoint, prompt, retries });
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim() ?? '';
      if (!text) throw new Error('Gemini returned empty response');

      const parsed = parseGeminiJson(text);
      const questionPayload = extractQuestionsPayload(parsed);
      const questions = sanitizeQuestions(questionPayload);
      if (!questions.length) throw new Error('Gemini returned invalid questions');
      return questions;
    } catch (error) {
      finalError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw finalError ?? new Error('Gemini question generation failed');
}

diagnosisRouter.post('/dynamic-questions', async (req, res, next) => {
  try {
    const body = req.body as {
      prompt?: string;
      firstAnswer?: string;
      category?: string;
      mode?: 'diagnosis' | 'direct';
      maxQuestions?: number;
    };

    const prompt = body.prompt?.trim();
    const firstAnswer = body.firstAnswer?.trim();
    if (!prompt || !firstAnswer) {
      return res.status(400).json({ message: 'prompt and firstAnswer are required' });
    }

    const category = body.category?.trim() || 'general';
    try {
      const questions = await generateGeminiQuestions({
        prompt,
        firstAnswer,
        category,
        mode: body.mode,
        maxQuestions: body.maxQuestions,
      });
      return res.json({ source: 'gemini', questions });
    } catch (error) {
      console.warn('[diagnosis] using fallback dynamic questions:', error);
      const questions = fallbackQuestions(category, firstAnswer);
      return res.json({ source: 'fallback', questions });
    }
  } catch (error) {
    return next(error);
  }
});

diagnosisRouter.post('/sessions', async (req, res, next) => {
  try {
    const user = req.authUser;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = user.userId;
    const body = req.body as {
      vehicleId?: string;
      symptoms?: string;
      attachments?: string[];
    };

    const vehicleId = body.vehicleId?.trim();
    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }

    const vehicle = await query<{ id: string }>(
      `SELECT id FROM vehicles WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [vehicleId, userId]
    );
    if (!vehicle.rows[0]) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const symptoms = (body.symptoms ?? '').trim();
    const lower = symptoms.toLowerCase();

    let urgency = 'Medium';
    let diyAllowed = false;
    let riskText = 'Performance degradation over time.';
    let issues: Array<{
      issue: string;
      solution: string;
      urgency: 'Low' | 'Medium' | 'High' | 'Critical';
      riskIfIgnored: string;
      requiresGarage: boolean;
      draftQuote: { totalEstimate: string; parts: string[]; laborTime: string };
    }>;

    if (lower.includes('brake') || lower.includes('squeak')) {
      urgency = 'High';
      diyAllowed = false;
      riskText = 'Reduced braking safety and potential rotor damage.';
      issues = [
        {
          issue: 'Worn Brake Pads or Rotor Wear',
          solution:
            'Inspect pad thickness and rotor surface. Replace pads and resurface/replace rotors as needed.',
          urgency: 'High',
          riskIfIgnored: riskText,
          requiresGarage: true,
          draftQuote: {
            totalEstimate: '$250 - $400',
            parts: ['Brake Pads', 'Brake Fluid'],
            laborTime: '1.5 hrs',
          },
        },
      ];
    } else if (lower.includes('battery') || lower.includes('start')) {
      urgency = 'Medium';
      diyAllowed = true;
      riskText = 'Vehicle may fail to start unexpectedly.';
      issues = [
        {
          issue: 'Battery Health Degradation',
          solution: 'Test battery CCA and charging system, replace battery if below threshold.',
          urgency: 'Medium',
          riskIfIgnored: riskText,
          requiresGarage: false,
          draftQuote: {
            totalEstimate: '$120 - $240',
            parts: ['12V Battery'],
            laborTime: '0.5 hrs',
          },
        },
      ];
    } else {
      urgency = 'Medium';
      diyAllowed = false;
      riskText = 'Continued use may increase repair scope and cost.';
      issues = [
        {
          issue: 'General Powertrain Performance Issue',
          solution:
            'Run OBD scan, check wear parts and fluid conditions, then proceed with targeted inspection.',
          urgency: 'Medium',
          riskIfIgnored: riskText,
          requiresGarage: true,
          draftQuote: {
            totalEstimate: '$150 - $320',
            parts: ['Service Kit', 'Fluid Top-up'],
            laborTime: '1.0 hrs',
          },
        },
      ];
    }

    const id = crypto.randomUUID();
    const created = await query<{ created_at: Date }>(
      `
        INSERT INTO diagnosis_sessions (
          id, customer_user_id, vehicle_id, symptoms_text, attachments,
          possible_issues, urgency, diy_allowed, risk_text, next_questions,
          draft_estimate_min, draft_estimate_max, status
        )
        VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10::jsonb,$11,$12,'diagnosis_ready')
        RETURNING created_at
      `,
      [
        id,
        userId,
        vehicleId,
        symptoms || null,
        JSON.stringify(body.attachments ?? []),
        JSON.stringify(issues),
        urgency.toLowerCase(),
        diyAllowed,
        riskText,
        JSON.stringify([]),
        Number(issues[0].draftQuote.totalEstimate.replace(/[^0-9]/g, '').slice(0, 3)) || 100,
        Number(issues[0].draftQuote.totalEstimate.replace(/[^0-9]/g, '').slice(-3)) || 300,
      ]
    );

    return res.status(201).json({
      diagnosisSessionId: id,
      createdAt: created.rows[0]?.created_at,
      diagnoses: issues,
    });
  } catch (error) {
    return next(error);
  }
});
