import { likeControl } from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId, type, which } = await request.json();
  const editedTodo = await likeControl(params.id, userId, type, which);
  if (editedTodo === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: editedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}
