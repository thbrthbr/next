import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import {
  fetchTodos,
  addReplay,
  getReplays,
  isMember,
  addMember,
  isAlreadyMember,
} from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (email === null || password === null) {
    const errMessage = {
      message: '실패',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  const addedTodo = await isAlreadyMember({
    email,
  });
  const response = {
    message: '무라사키',
    data: addedTodo,
  };
  return Response.json(response, { status: 200 });
}
