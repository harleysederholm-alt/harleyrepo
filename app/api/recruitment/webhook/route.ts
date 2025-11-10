import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Main webhook endpoint for recruitment workflows
 * Triggered from Next.js frontend to initiate n8n workflows
 *
 * Expected triggers:
 * - JOB_CREATION: When a new job is created
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, job_id, title, description_prompt, location } = body;

    if (!trigger || !job_id) {
      return NextResponse.json(
        { error: 'Missing required fields: trigger, job_id' },
        { status: 400 }
      );
    }

    // NOTE: In production, this would call your n8n webhook URL
    // Example: https://your-n8n-instance.com/webhook/recruitment-create-job
    // For now, we'll just log and return success

    console.log('[Recruitment Webhook]', {
      trigger,
      job_id,
      timestamp: new Date().toISOString(),
    });

    // Store webhook event in database for audit trail
    const supabase = createClient();

    // TODO: Create a webhook_events table to track all n8n triggers
    // const { error } = await supabase
    //   .from('webhook_events')
    //   .insert({
    //     trigger,
    //     job_id,
    //     payload: body,
    //     status: 'queued',
    //   });

    // If JOB_CREATION trigger, n8n workflow should:
    // 1. Call Claude API to generate professional job description
    // 2. Update job record with generated_description
    // 3. Send notification to manager

    return NextResponse.json({
      success: true,
      message: `Workflow triggered: ${trigger}`,
      job_id,
    });
  } catch (error) {
    console.error('[Recruitment Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Recruitment webhook endpoint is running',
    endpoints: {
      'POST /api/recruitment/webhook': 'Main webhook for n8n workflows',
      'POST /api/recruitment/schedule-interview': 'Schedule interview workflow',
      'POST /api/recruitment/decision': 'Send decision emails',
    },
  });
}
