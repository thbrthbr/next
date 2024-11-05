'use client';

import EachList from './each-list';

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
  dones: Todo[];
  func: () => void;
}

export default function List(props: Props) {
  const { todos, dones, func } = props;
  return (
    <div className="list">
      <EachList todos={todos} status="yet" func={func} />
      <EachList todos={dones} status="already" func={func} />
    </div>
  );
}
