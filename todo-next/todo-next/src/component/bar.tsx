'use client';

interface Todo {
  id: number;
  name: string;
  isCompleted: boolean;
  imageUrl: string;
  memo: string;
  tenantId: string;
}

interface Props {
  setNewTodo: React.Dispatch<React.SetStateAction<Todo>>;
  newTodo: Todo;
  func: () => void;
}

export default function Bar(props: Props) {
  const { setNewTodo, newTodo, func } = props;

  const addTodos = async () => {
    await fetch(`https://assignment-todolist-api.vercel.app/api/thbr/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTodo.name }),
      cache: 'no-store',
    });
    func();
  };

  const handleEnter = <T extends HTMLElement>(e: React.KeyboardEvent<T>) => {
    if (e.key == 'Enter') {
      addTodos();
    }
  };

  return (
    <input
      placeholder="할 일을 입력해주세요"
      className="add-input"
      value={newTodo.name}
      onChange={(e) => {
        setNewTodo({ ...newTodo, name: e.target.value });
      }}
      onKeyUp={handleEnter}
    ></input>
  );
}
