import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import { fetchTodos, addTodo } from '@/data/firebase';
export async function GET(request: NextRequest) {
  const fetchedTodos = await fetchTodos();
  const response = {
    message: '구광',
    data: fetchedTodos,
  };
  return NextResponse.json(response, { status: 201 });
}
export async function POST(request: NextRequest) {
  const { title } = await request.json();
  if (title === null) {
    const errMessage = {
      message: '해치웠나',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  const addedTodo = await addTodo({ title });
  const response = {
    message: '무라사키',
    data: addedTodo,
  };
  return Response.json(response, { status: 200 });
}
