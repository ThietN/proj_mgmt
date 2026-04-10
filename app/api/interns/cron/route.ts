import { NextResponse } from 'next/server';
import { autoApproveInterns } from '@/lib/database';

export async function GET() {
    try {
        const updated = await autoApproveInterns();
        return NextResponse.json({ 
            message: 'Auto-completion job finished', 
            count: updated?.length || 0,
            updated 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
