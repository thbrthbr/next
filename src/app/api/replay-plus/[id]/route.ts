import {
  deleteReplay,
  getReplay,
  getMoreReplays,
  getCommentsNum,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const fetchedComments = await getCommentsNum();
  let commentTask: any = {};
  for (let i = 0; i < fetchedComments.length; i++) {
    if (commentTask[fetchedComments[i].pageid]) {
      commentTask[fetchedComments[i].pageid] += 1;
    } else {
      commentTask[fetchedComments[i].pageid] = 1;
    }
  }
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const fetchedReplay = await getMoreReplays(params.id);
  for (let i = 0; i < fetchedReplay.length; i++) {
    if (commentTask[fetchedReplay[i].id]) {
      fetchedReplay[i].commentNum = commentTask[fetchedReplay[i].id];
    } else {
      fetchedReplay[i].commentNum = 0;
    }
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
