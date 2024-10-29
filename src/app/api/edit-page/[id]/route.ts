import { getEditPost } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const num = params.id.split('*')[0];
  const id = params.id.split('*')[1];
  console.log(num);
  console.log(id);
  const fetchedPost = await getEditPost({ num, id });
  if (fetchedPost === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: fetchedPost,
  };
  return NextResponse.json(response, { status: 201 });
}
