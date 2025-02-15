import { useEffect, useState } from "react";
import Todo from "./Todo";
export default function App() {
  const [todos, setTodos] = useState([]);
  const [content, setContent] = useState("");

  // Fetch todos on component mount
  useEffect(() => {
    const getTodos = async () => {
      const res = await fetch("/api/todos");
      const todos = await res.json();
      setTodos(todos);
    };

    getTodos();
  }, []);

  // Create a new todo
  const createNewTodo = async (e) => {
    e.preventDefault();
    if (content.length > 3) {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ todo: content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const newTodo = await res.json();

      setContent(""); // Clear the input field
      setTodos([...todos, newTodo]); // Add the new todo to the list
    }
  };

  return (
    <main className="container">
      <h1 className="title">Awesome Todos</h1>

      {/* Form for creating a new todo */}
      <form className="form" onSubmit={createNewTodo}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter a new todo..."
          className="form__input"
          required
        />
        <button type="submit">Create Todo</button>
      </form>

      {/* Display the list of todos */}
      <div className="todos">
        {(todos.length > 0) &&
          todos.map((todo) => (
            <Todo todo={todo} setTodos={setTodos} key={todo._id} />
          ))
        }
      </div>
    </main>
  );
}