import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import { deleteMember } from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

export async function POST(request: NextRequest) {
  const { email, pw } = await request.json();
  if (email === null || pw === null) {
    const errMessage = {
      message: '실패',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  const addedTodo = await deleteMember({
    email,
    pw,
  });
  const response = {
    message: '무라사키',
    data: addedTodo,
  };
  return Response.json(response, { status: 200 });
}
