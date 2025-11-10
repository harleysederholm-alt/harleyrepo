import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Webhook endpoint for handling recruitment decisions
 * Triggered when candidate is moved to "rejected" or "hired" status
 *
 * n8n Workflow D should:
 * 1. For REJECTION: Generate polite, personalized rejection email
 * 2. For OFFER: Generate congratulations email + prepare employment contract
 */
export async function POST(request: NextRequest) {
  try {
    const { candidate_id, job_id, decision } = await request.json();

    if (!candidate_id || !job_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: candidate_id, job_id, decision' },
        { status: 400 }
      );
    }

    if (!['rejected', 'hired'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "rejected" or "hired"' },
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

    console.log('[Decision Webhook]', {
      decision,
      candidate_id,
      candidate_name: candidate.name,
      job_id,
      job_title: job.title,
      timestamp: new Date().toISOString(),
    });

    // Mark email as sent to avoid duplicates
    const emailSentField = decision === 'rejected' ? 'rejection_email_sent' : 'offer_email_sent';
    await supabase
      .from('candidates')
      .update({ [emailSentField]: true })
      .eq('id', candidate_id);

    // NOTE: In production, trigger n8n workflow:
    // POST https://your-n8n-instance.com/webhook/recruitment-decision
    // Payload:
    // {
    //   decision: "rejected" or "hired",
    //   candidate: {
    //     id: candidate.id,
    //     name: candidate.name,
    //     email: candidate.email,
    //     ai_score: candidate.ai_score,
    //   },
    //   job: {
    //     id: job.id,
    //     title: job.title,
    //   },
    // }

    // For REJECTION:
    // n8n will use Claude to generate professional rejection email in Finnish:
    // - Thank them for applying
    // - Acknowledge their strengths
    // - Explain they weren't selected
    // - Encourage future applications
    // - Send email

    // For OFFER:
    // n8n will:
    // 1. Use Claude to generate congratulations email
    // 2. Prepare employment contract template with candidate details
    // 3. Send email with next steps
    // 4. Create follow-up tasks for manager

    return NextResponse.json({
      success: true,
      message: `${decision.charAt(0).toUpperCase() + decision.slice(1)} email workflow triggered`,
      candidate_id,
      job_id,
      decision,
    });
  } catch (error) {
    console.error('[Decision Webhook Error]', error);
    return NextResponse.json(
      { error: 'Decision workflow failed' },
      { status: 500 }
    );
  }
}
