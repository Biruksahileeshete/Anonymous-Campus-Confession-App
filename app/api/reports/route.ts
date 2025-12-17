import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reports with related data
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        *,
        confessions!inner(
          id,
          content,
          user_id,
          users!inner(
            full_name,
            email
          )
        ),
        reporter:users!reports_reported_by_fkey(
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Format the response
    const formattedReports = reports?.map(report => ({
      id: report.id,
      confession_id: report.confession_id,
      reported_by: report.reported_by,
      reason: report.reason,
      explanation: report.explanation,
      created_at: report.created_at,
      confession_content: report.confessions?.content,
      confession_author_id: report.confessions?.user_id,
      author_name: report.confessions?.users?.full_name,
      author_email: report.confessions?.users?.email,
      reporter_name: report.reporter?.full_name,
      reporter_email: report.reporter?.email
    })) || [];

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confession_id, reason, explanation, reported_by } = await request.json();

    if (!confession_id || !reason || !reported_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already reported by this user
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('confession_id', confession_id)
      .eq('reported_by', reported_by)
      .single();

    if (existingReport) {
      return NextResponse.json({ error: 'Already reported by this user' }, { status: 409 });
    }

    // Create the report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        confession_id,
        reported_by,
        reason,
        explanation: explanation || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Report submitted successfully',
      report 
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}