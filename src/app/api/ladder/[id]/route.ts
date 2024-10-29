import { getLadder, tempAddLadder } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const fetchedSearchPosts = await getLadder({ season: params.id });
  if (fetchedSearchPosts === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: fetchedSearchPosts,
  };

  return NextResponse.json(response, { status: 201 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const data = await request.json();
  const addLadder = await tempAddLadder(data);
  if (addLadder === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: addLadder,
  };
  return NextResponse.json(response, { status: 201 });
}
