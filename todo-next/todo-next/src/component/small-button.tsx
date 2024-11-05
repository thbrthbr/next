'use client';

import plusIcon from '../asset/Frame 2610256.png';

interface Todo {
  id: number;
  imageUrl: string;
  isCompleted: boolean;
  memo: string;
  name: string;
  tenantId: string;
}

interface Props {
  newTodo: Todo;
  func: () => void;
  type: string;
}

export default function SmallButton(props: Props) {
  const { newTodo, func } = props;

  const addTodos = async () => {
    await fetch(`https://assignment-todolist-api.vercel.app/api/thbr/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTodo.name }),
      cache: 'no-store',
    });
    func();
  };

  return (
    <button className="add-button-small" onClick={addTodos}>
      <img className="add-button-icon" src={plusIcon.src} />
    </button>
  );
}
