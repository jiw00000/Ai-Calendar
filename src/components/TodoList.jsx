import React from 'react'
import { Plus, X, Square, CheckSquare } from 'lucide-react'

export default function TodoList({ todos, onAddTodoManual, onToggleTodo, onDeleteTodo, userEmail, onSignOut }) {
  const safeTodos = todos || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline">
        <h3 className="text-base font-bold text-neutral-950">할 일</h3>
        <span className="text-xs font-mono text-neutral-400">{safeTodos.filter(t => !t.completed).length}개 남음</span>
      </div>

      <form onSubmit={onAddTodoManual} className="flex gap-2">
        <input name="todoInput" type="text" placeholder="새 할 일을 입력하고 Enter..." className="flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900" />
        <button type="submit" className="rounded-sm bg-neutral-950 px-4 py-2 text-sm font-medium text-white flex items-center gap-1 hover:opacity-90"><Plus size={14} /><span>추가</span></button>
      </form>

      <div className="divide-y divide-neutral-200 border-b border-neutral-200">
        {safeTodos.filter(t => !t.completed).map(todo => (
          <div key={todo.id} className="flex items-center justify-between py-3 group">
            <div className="flex items-center gap-3">
              <button onClick={() => onToggleTodo(todo.id, todo.completed)} className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
              <div className="flex items-baseline gap-2">
                {todo.color && <span style={{ backgroundColor: todo.color }} className="w-1.5 h-1.5 rounded-full block"></span>}
                <span className="text-sm text-neutral-800">{todo.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {todo.date && <span className="text-xs font-mono text-neutral-400">{todo.date.slice(5)}</span>}
              <button onClick={() => onDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block"><X size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <p className="text-xs text-neutral-400 font-mono">완료됨 — {safeTodos.filter(t => t.completed).length}</p>
        <div className="divide-y divide-neutral-100">
          {safeTodos.filter(t => t.completed).map(todo => (
            <div key={todo.id} className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <button onClick={() => onToggleTodo(todo.id, todo.completed)} className="text-neutral-950"><CheckSquare size={18} /></button>
                <span className="text-sm text-neutral-400 line-through">{todo.title}</span>
              </div>
              <button onClick={() => onDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block"><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <button onClick={onSignOut} className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-4">로그아웃 계정: {userEmail}</button>
      </div>
    </div>
  )
}