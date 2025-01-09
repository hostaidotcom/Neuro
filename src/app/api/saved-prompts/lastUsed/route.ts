import { verifyUser } from "@/server/actions/user";
import { updateLastUsedPrompt } from "@/server/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest){
    try {
        const session = await verifyUser();
        const userId = session?.data?.data?.id;
    
        if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        const { id } = await req.json();
    
        if (!id) {
            return NextResponse.json({ error: 'Missing Prompt Id' }, { status: 400 });
        }
    
        const updatedPrompt = await updateLastUsedPrompt(id);
        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating favorite status:', error);
        return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
        );
    }
}