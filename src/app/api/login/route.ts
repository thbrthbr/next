import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import { fetchTodos, addReplay, getReplays, isMember } from '@/data/firebase';
import { useSearchParams } from 'next/navigation';

// export async function GET(request: NextRequest) {
//   // console.log(await request.json());
//   // let params = useSearchParams();
//   // console.log(params);
//   const fetchedReplays = await getReplays();
//   const response = {
//     message: '성공',
//     data: fetchedReplays,
//     status: 201,
//   };
//   return NextResponse.json(response, { status: 201 });
// }

export async function POST(request: NextRequest) {
  const { email, pw } = await request.json();
  if (email === null || pw === null) {
    const errMessage = {
      message: '성공',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  const addedTodo = await isMember({
    email,
    pw,
  });
  const response = {
    message: '무라사키',
    data: addedTodo,
  };
  return Response.json(response, { status: 200 });
}
