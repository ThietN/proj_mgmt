import { NextResponse } from 'next/server';
import { convertToBillable } from '@/lib/database';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { intern_id, project, billing_rate, notes } = body;
        if (!intern_id) {
            return NextResponse.json({ error: 'Intern ID is required' }, { status: 400 });
        }
        await convertToBillable(intern_id, project || "Internal", Number(billing_rate || 500), notes);
        return NextResponse.json({ message: 'Intern converted to billable resource' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
