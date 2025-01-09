import { verifyUser } from "@/server/actions/user";
import { setFavoritePrompt } from "@/server/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest){
    try {
        const session = await verifyUser();
        const userId = session?.data?.data?.id;
    
        if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        const { id, isFavorite } = await req.json();
    
        if (!id || typeof isFavorite !== 'boolean') {
        return NextResponse.json({ error: 'Missing id or isFavorite' }, { status: 400 });
        }
    
        const updatedPrompt = await setFavoritePrompt(id, isFavorite);
        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating favorite status:', error);
        return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
        );
    }
}