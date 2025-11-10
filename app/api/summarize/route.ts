import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { task_id, comments } = await request.json();

    if (!task_id || !comments || !Array.isArray(comments)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Verify user has access to this task
    const { data: task } = await supabase
      .from('tasks')
      .select('id, project_id')
      .eq('id', task_id)
      .single();

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', task.project_id)
      .in('org_id', [
        // Get orgs where user is a member
        supabase
          .from('org_members')
          .select('org_id')
          .eq('member_id', user.id),
      ]);

    if (!project) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Call Claude API to summarize
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const commentsText = comments
      .map((comment, index) => `${index + 1}. ${comment}`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Summarize the following comments in one clear, concise sentence that captures the key points:\n\n${commentsText}`,
        },
      ],
    });

    const summary =
      message.content[0].type === 'text'
        ? message.content[0].text
        : 'Unable to generate summary';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing comments:', error);
    return NextResponse.json(
      { error: 'Failed to summarize comments' },
      { status: 500 }
    );
  }
}
