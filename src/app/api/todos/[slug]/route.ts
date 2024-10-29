import { NextRequest, NextResponse } from 'next/server';
import { fetchATodo, deleteATodo, editATodo } from '@/data/firebase';
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  const fetchedTodo = await fetchATodo(params.slug);

  if (fetchedTodo === null) {
    return new Response(null, { status: 204 });
  }

  const response = {
    message: '영역전개',
    data: fetchedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const deleteTodo = await deleteATodo(params.slug);
  const response = {
    message: '무라사키',
    data: deleteTodo,
  };
  if (deleteTodo === null) return new Response(null, { status: 204 });
  return NextResponse.json(response, { status: 201 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { title, is_done } = await request.json();
  const editedTodo = await editATodo(params.slug, { title, is_done });

  if (editedTodo === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '반전술식',
    data: editedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}
