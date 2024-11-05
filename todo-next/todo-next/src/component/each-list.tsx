'use client';

import EachItem from './each-item';
import Empty from './empty';
import { useState } from 'react';

interface Todo {
  id: number;
  imageUrl: string;
  isCompleted: boolean;
  memo: string;
  name: string;
  tenantId: string;
}

interface Props {
  todos: Todo[];
  status: string;
  func: () => void;
}

export default function EachList(props: Props) {
  const { todos, status, func } = props;
  const [dummy, setDummy] = useState<Todo>({
    id: 0,
    imageUrl: '',
    isCompleted: false,
    memo: '',
    name: '',
    tenantId: '',
  });
  return (
    <div className="each-list">
      {status == 'yet' ? (
        <div className="type-todo">
          <div>TO DO</div>
        </div>
      ) : (
        <div className="type-done">DONE</div>
      )}
      {todos.length > 0 ? (
        <div>
          {todos.map((todo: Todo, idx: number) => {
            return (
              <EachItem
                key={status + idx}
                id={todo.id}
                name={todo}
                setName={setDummy}
                status={status}
                isDetail={false}
                func={func}
              ></EachItem>
            );
          })}
        </div>
      ) : (
        <Empty type={status} />
      )}
    </div>
  );
}
