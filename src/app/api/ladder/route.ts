import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import { addLadder, getSeasonData } from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

export async function GET(request: NextRequest) {
  const fetchedReplays = await getSeasonData();
  const response = {
    message: '성공',
    data: fetchedReplays,
    status: 201,
  };
  return NextResponse.json(response, { status: 201 });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  let response = {};
  const ladderData = await addLadder(data);
  response = {
    message: '성공',
    data: ladderData,
  };
  return Response.json(response, { status: 200 });
}
