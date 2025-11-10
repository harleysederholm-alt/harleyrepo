'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { createClient } from '@/lib/supabase/browser';
import { Column, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
  columns: Column[];
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

export default function KanbanBoard({
  projectId,
  columns,
  tasks,
  onTaskSelect,
}: KanbanBoardProps) {
  const [localColumns, setLocalColumns] = useState(columns);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle task dragging
    if (type === 'TASK') {
      const task = localTasks.find((t) => t.id === draggableId);
      if (!task) return;

      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      // Reorder tasks locally
      const tasksInSourceColumn = localTasks
        .filter((t) => t.column_id === sourceColumnId)
        .sort((a, b) => a.order - b.order);

      const tasksInDestColumn = localTasks
        .filter((t) => t.column_id === destColumnId)
        .sort((a, b) => a.order - b.order);

      // Remove from source
      tasksInSourceColumn.splice(source.index, 1);

      // Add to destination
      tasksInDestColumn.splice(destination.index, 0, task);

      // Update local state
      const updatedTask = {
        ...task,
        column_id: destColumnId,
        order: destination.index,
      };

      const newTasks = localTasks.map((t) => {
        if (t.id === task.id) {
          return updatedTask;
        }
        if (t.column_id === sourceColumnId) {
          return {
            ...t,
            order: tasksInSourceColumn.indexOf(t),
          };
        }
        if (t.column_id === destColumnId) {
          return {
            ...t,
            order: tasksInDestColumn.indexOf(t),
          };
        }
        return t;
      });

      setLocalTasks(newTasks);

      // Update in database
      const supabase = createClient();
      await supabase
        .from('tasks')
        .update({
          column_id: destColumnId,
          order: destination.index,
        })
        .eq('id', task.id);

      // Update order for all affected tasks
      const updates = newTasks
        .filter((t) => t.column_id === destColumnId || t.column_id === sourceColumnId)
        .map((t) =>
          supabase
            .from('tasks')
            .update({ order: t.order })
            .eq('id', t.id)
        );

      await Promise.all(updates);
    }
  };

  const handleCreateTask = async (columnId: string) => {
    const title = newTaskTitle[columnId]?.trim();
    if (!title) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const maxOrder =
      Math.max(
        ...localTasks
          .filter((t) => t.column_id === columnId)
          .map((t) => t.order),
        -1
      ) + 1;

    const { data: newTask } = await supabase
      .from('tasks')
      .insert([
        {
          project_id: projectId,
          column_id: columnId,
          title,
          order: maxOrder,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (newTask) {
      setLocalTasks([...localTasks, newTask]);
      setNewTaskTitle({ ...newTaskTitle, [columnId]: '' });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {localColumns.map((column) => {
          const columnTasks = localTasks
            .filter((t) => t.column_id === column.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 rounded-lg bg-slate-100 dark:bg-slate-800 p-4"
            >
              {/* Column Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {column.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-96 rounded space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskSelect(task)}
                            className={`bg-white dark:bg-slate-700 rounded p-3 cursor-pointer transition-all hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            }`}
                          >
                            <div className="flex gap-2">
                              <GripVertical className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900 dark:text-white break-words">
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add New Task */}
              <div className="mt-4 space-y-2">
                {newTaskTitle[column.id] ? (
                  <>
                    <input
                      type="text"
                      value={newTaskTitle[column.id]}
                      onChange={(e) =>
                        setNewTaskTitle({
                          ...newTaskTitle,
                          [column.id]: e.target.value,
                        })
                      }
                      placeholder="Task title..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTask(column.id);
                        } else if (e.key === 'Escape') {
                          setNewTaskTitle({
                            ...newTaskTitle,
                            [column.id]: '',
                          });
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCreateTask(column.id)}
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setNewTaskTitle({
                            ...newTaskTitle,
                            [column.id]: '',
                          })
                        }
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNewTaskTitle({
                        ...newTaskTitle,
                        [column.id]: '',
                      })
                    }
                    className="w-full justify-start text-slate-500 hover:text-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
