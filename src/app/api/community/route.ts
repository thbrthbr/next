import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import {
  fetchTodos,
  addReplay,
  getReplays,
  addComment,
  getBoards,
} from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

export async function GET(request: NextRequest) {
  const fetchedBoards = await getBoards();
  console.log(fetchedBoards);
  const response = {
    message: '성공',
    data: fetchedBoards,
    status: 201,
  };
  return NextResponse.json(response, { status: 201 });
}

// export async function POST(request: NextRequest) {
//   const { email, id, pw, content, pageid } = await request.json();

//   const addedTodo = await addComment({
//     email,
//     id,
//     pw,
//     content,
//     pageid,
//   });
//   const response = {
//     message: '성공',
//     data: addedTodo,
//   };
//   return Response.json(response, { status: 200 });
// }
