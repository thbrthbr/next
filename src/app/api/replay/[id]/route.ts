import { deleteReplay, getReplay, likeControl } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const fetchedReplay = await getReplay(params.id);
  if (fetchedReplay === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: fetchedReplay,
  };
  return NextResponse.json(response, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const deleteAReplay = await deleteReplay(params.id);
  const response = {
    message: '성공',
    data: deleteAReplay,
  };
  if (deleteAReplay === null) return new Response(null, { status: 204 });
  return NextResponse.json(response, { status: 201 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = await request.json();
  const editedTodo = await likeControl(params.id, userId);
  console.log(userId);
  if (editedTodo === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: editedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}
