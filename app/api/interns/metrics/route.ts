import { NextResponse } from 'next/server';
import { getInternMetrics } from '@/lib/database';

export async function GET() {
    try {
        const metrics = await getInternMetrics();
        return NextResponse.json(metrics);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
