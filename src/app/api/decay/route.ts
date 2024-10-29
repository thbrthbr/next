import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import { addLadder, decay, getSeasonData } from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

export async function POST(request: NextRequest) {
  const data = await request.json();
  let response = {};
  const ladderData = await decay(data[0]);
  response = {
    message: '성공',
    data: ladderData,
  };
  return Response.json(response, { status: 200 });
}
