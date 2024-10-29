import {
  deleteComment,
  deleteReplay,
  editComment,
  getComments,
  getReplay,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const id = params.id.split(':')[0];
  const page = params.id.split(':')[1];
  const fetchedReplay = await getComments(id, Number(page));
  if (fetchedReplay === null) {
    return NextResponse.json(
      {
        message: '성공',
        data: [],
      },
      { status: 201 },
    );
  } else {
    return NextResponse.json(
      {
        message: '성공',
        data: fetchedReplay,
      },
      { status: 201 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const deleteAComment = await deleteComment(params.id);
  const response = {
    message: '성공',
    data: deleteAComment,
  };
  if (deleteAComment === null) return new Response(null, { status: 204 });
  return NextResponse.json(response, { status: 201 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const data = await request.json();
  const editedTodo = await editComment(params.id, data);
  if (editedTodo === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: editedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}
