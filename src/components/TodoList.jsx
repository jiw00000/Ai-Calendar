import React from 'react'
import { Plus, X, Square, CheckSquare } from 'lucide-react'

export default function TodoList({ todos, onAddTodoManual, onToggleTodo, onDeleteTodo, userEmail, onSignOut, darkMode }) {
  const safeTodos = todos || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline">
        <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>할 일</h3>
        <span className="text-xs font-mono text-neutral-400">{safeTodos.filter(t => !t.completed).length}개 남음</span>
      </div>

      <form onSubmit={onAddTodoManual} className="flex gap-2">
        {/* 💡 [형태 유지] rounded-none 스퀘어 입력을 유지하고 테마 색상만 다크하게 결합 */}
        <input 
          name="todoInput" type="text" placeholder="새 할 일을 입력하고 Enter..." 
          className={`flex-1 rounded-none border px-3 py-2 text-sm outline-none transition-all ${
            darkMode 
              ? 'border-neutral-800 bg-neutral-900 text-white placeholder-neutral-600 focus:border-neutral-600' 
              : 'border-neutral-300 bg-white text-neutral-950 placeholder-neutral-400 focus:border-neutral-900'
          }`} 
        />
        <button type="submit" className={`rounded-none px-4 py-2 text-sm font-medium text-white flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all flex-shrink-0 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-950'}`}><Plus size={14} /><span>추가</span></button>
      </form>

      <div className={`divide-y border-b transition-colors ${darkMode ? 'divide-neutral-800 border-neutral-800' : 'divide-neutral-200 border-neutral-200'}`}>
        {safeTodos.filter(t => !t.completed).map(todo => (
          <div key={todo.id} className="flex items-center justify-between py-3 group rounded-none">
            <div className="flex items-center gap-3">
              <button onClick={() => onToggleTodo(todo.id, todo.completed)} className="text-neutral-300 hover:text-neutral-500 cursor-pointer"><Square size={18} /></button>
              <div className="flex items-baseline gap-2">
                {todo.color && <span style={{ backgroundColor: todo.color }} className="w-1.5 h-1.5 rounded-none block"></span>}
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{todo.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {todo.date && <span className="text-xs font-mono text-neutral-400">{todo.date.slice(5)}</span>}
              <button onClick={() => onDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block cursor-pointer"><X size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <p className="text-xs text-neutral-400 font-mono">완료됨 — {safeTodos.filter(t => t.completed).length}</p>
        <div className={`divide-y ${darkMode ? 'divide-neutral-900' : 'divide-neutral-100'}`}>
          {safeTodos.filter(t => t.completed).map(todo => (
            <div key={todo.id} className="flex items-center justify-between py-2 group rounded-none">
              <div className="flex items-center gap-3">
                <button onClick={() => onToggleTodo(todo.id, todo.completed)} className={`${darkMode ? 'text-white' : 'text-neutral-950'} cursor-pointer`}><CheckSquare size={18} /></button>
                <span className={`text-sm line-through ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{todo.title}</span>
              </div>
              <button onClick={() => onDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block cursor-pointer"><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <button onClick={onSignOut} className={`text-xs underline underline-offset-4 cursor-pointer ${darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-900'}`}>로그아웃 계정: {userEmail}</button>
      </div>
    </div>
  )
}