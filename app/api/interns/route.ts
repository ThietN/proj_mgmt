import { NextResponse } from 'next/server';
import { getInterns, createIntern, updateIntern, deleteIntern } from '@/lib/database';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            status: searchParams.get('status'),
            project: searchParams.get('project'),
            mentor: searchParams.get('mentor'),
            is_billable: searchParams.get('is_billable') === 'true' ? true : searchParams.get('is_billable') === 'false' ? false : undefined,
            final_grade: searchParams.get('final_grade')
        };
        const interns = await getInterns(filters);
        return NextResponse.json(interns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await createIntern(body);
        return NextResponse.json({ message: 'Intern created successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const body = await request.json();
        await updateIntern(id, body);
        return NextResponse.json({ message: 'Intern updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await deleteIntern(id);
        return NextResponse.json({ message: 'Intern deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
