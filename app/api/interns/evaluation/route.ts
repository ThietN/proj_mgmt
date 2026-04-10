import { NextResponse } from 'next/server';
import { evaluateIntern } from '@/lib/database';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await evaluateIntern(body);
        return NextResponse.json({ message: 'Evaluation submitted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
