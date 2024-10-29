import { getUserProfile } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const fetchedProfile = await getUserProfile(params.id);

  if (fetchedProfile === null) {
    return new Response(null, { status: 204 });
  }

  const response = {
    message: '성공',
    data: fetchedProfile,
  };
  return NextResponse.json(response, { status: 201 });
}
