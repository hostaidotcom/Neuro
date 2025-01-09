import { getSavedPrompts, createSavedPrompt, deleteSavedPrompt } from '@/server/db/queries';
import { verifyUser } from '@/server/actions/user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
try {
    const session = await verifyUser();
    const userId = session?.data?.data?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await getSavedPrompts(userId);
    console.log(prompts);
    return NextResponse.json({prompts});
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyUser();
    const userId = session?.data?.data?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title and content' }, { status: 400 });
    }

    const savedPrompt = await createSavedPrompt(userId, title, content);
    return NextResponse.json(savedPrompt);
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifyUser();
    const userId = session?.data?.data?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await deleteSavedPrompt(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}