import {
  deleteReplay,
  getReplay,
  searchCodeReplay,
  searchReplay,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page');
  const mode = searchParams.get('mode');
  let fetchedReplay;
  if (mode == 'code') {
    fetchedReplay = await searchCodeReplay(params.id);
  } else {
    fetchedReplay = await searchReplay(params.id, page);
  }
  if (fetchedReplay === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: fetchedReplay,
  };
  return NextResponse.json(response, { status: 201 });
}
