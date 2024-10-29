import { deleteReplay, getPost, getReplay, likeControl } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const num = params.id;
  // console.log(num);
  const fetchedPost = await getPost({ num });
  if (fetchedPost === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: fetchedPost,
  };
  return NextResponse.json(response, { status: 201 });
}
