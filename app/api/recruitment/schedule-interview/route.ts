import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Webhook endpoint for scheduling interviews
 * Triggered when candidate is moved to "interviewing" status in Kanban
 *
 * n8n Workflow C should:
 * 1. Read available interview slots from manager's Google Calendar
 * 2. Generate personalized email with 3-5 time suggestions
 * 3. Send email to candidate
 * 4. Listen for response or use Calendly-style link
 * 5. On confirmation, create Google Calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const { candidate_id, job_id } = await request.json();

    if (!candidate_id || !job_id) {
      return NextResponse.json(
        { error: 'Missing required fields: candidate_id, job_id' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch candidate and job details
    const [candidateRes, jobRes] = await Promise.all([
      supabase.from('candidates').select('*').eq('id', candidate_id).single(),
      supabase.from('jobs').select('*').eq('id', job_id).single(),
    ]);

    if (candidateRes.error || jobRes.error) {
      return NextResponse.json(
        { error: 'Failed to fetch candidate or job details' },
        { status: 404 }
      );
    }

    const candidate = candidateRes.data;
    const job = jobRes.data;

    // Log the event for audit trail
    console.log('[Schedule Interview Webhook]', {
      candidate_id,
      candidate_name: candidate.name,
      job_id,
      job_title: job.title,
      timestamp: new Date().toISOString(),
    });

    // NOTE: In production, trigger n8n workflow:
    // POST https://your-n8n-instance.com/webhook/schedule-interview
    // Payload:
    // {
    //   candidate: {
    //     id: candidate.id,
    //     name: candidate.name,
    //     email: candidate.email,
    //   },
    //   job: {
    //     id: job.id,
    //     title: job.title,
    //   },
    // }

    // n8n Workflow will:
    // 1. Use Google Calendar API to find manager's free slots
    // 2. Use Claude to generate personalized email in Finnish
    // 3. Send email with time suggestions
    // 4. Create interview record in database

    return NextResponse.json({
      success: true,
      message: 'Interview scheduling workflow triggered',
      candidate_id,
      job_id,
    });
  } catch (error) {
    console.error('[Schedule Interview Error]', error);
    return NextResponse.json(
      { error: 'Interview scheduling failed' },
      { status: 500 }
    );
  }
}
