import { Component, OnInit } from '@angular/core';
import {
  LucideCheck,
  LucideCirclePlus,
  LucideCircleX,
  LucideEllipsis,
  LucideInfo,
  LucidePencil,
  LucideSettings2,
  LucideTrash2,
} from '@lucide/angular';
import { TaskModel, TaskPriority } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { v4 as uuidV4 } from 'uuid';
import { format, isToday, isYesterday } from 'date-fns';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [
    LucideSettings2,
    LucideEllipsis,
    LucideCirclePlus,
    LucideCircleX,
    FormsModule,
    LucidePencil,
    LucideTrash2,
    LucideCheck,
    LucideInfo,
    NgClass,
  ],
  templateUrl: './task.html',
  styleUrl: './task.css',
})
export class Task implements OnInit {
  showMenu: boolean = false;
  showModal: boolean = false;
  newTaskInputValue: string = '';
  taskPriority = TaskPriority;
  isPrioritySorted: boolean = false;
  isEditing: boolean = false;
  editingTaskId: string | null = null;

  selectedPriority: TaskPriority = TaskPriority.LOW;

  tasks: TaskModel[] = [];
  groupedTasks: { [key: string]: TaskModel[] } = {};
  groupLabels: string[] = [];

  priorityInfo: { color: string; label: string }[] = [
    { color: 'bg-blue-500', label: 'low priority' },
    { color: 'bg-yellow-500', label: 'medium priority' },
    { color: 'bg-red-500', label: 'high priority' },
  ];

  toggleShowMenu = (): boolean => (this.showMenu = !this.showMenu);

  handleShowModal(): void {
    this.showMenu = false;
    this.showModal = true;
    this.isEditing = false;
  }

  handleCloseModal = (): boolean => (this.showModal = false);

  handleSaveTask(evt: SubmitEvent) {
    evt.preventDefault();

    if (!this.newTaskInputValue) return;

    if (this.isEditing && this.editingTaskId) {
      this.tasks = this.tasks.map((task) =>
        task.id === this.editingTaskId
          ? { ...task, name: this.newTaskInputValue, priority: this.selectedPriority }
          : task,
      );
    } else {
      const newTask: TaskModel = {
        id: uuidV4(),
        name: this.newTaskInputValue,
        completed: false,
        createdAt: Date.now(),
        priority: this.selectedPriority,
      };

      this.tasks.unshift(newTask);
    }

    this.updateGroups();
    this.saveToLocalStorage();
    this.handleCloseModal();

    this.newTaskInputValue = '';
    this.selectedPriority = this.taskPriority.LOW;
    this.isEditing = false;
    this.editingTaskId = null;
  }

  updateGroups(): void {
    this.groupedTasks = {};
    this.groupLabels = [];

    this.tasks.forEach((task): void => {
      const date = new Date(task.createdAt);

      let label = '';

      if (isYesterday(date)) label = 'yesterday';
      else if (isToday(date)) label = 'today';
      else label = format(date, 'MMMM').toLowerCase();

      if (!this.groupedTasks[label]) {
        this.groupedTasks[label] = [];

        this.groupLabels.push(label);
      }

      this.groupedTasks[label].push(task);
    });
  }

  toggleCompleted(id: string): void {
    this.tasks = this.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));

    this.updateGroups();

    this.saveToLocalStorage();
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);

    this.updateGroups();

    this.saveToLocalStorage();
  }

  editTask(task: TaskModel): void {
    this.isEditing = true;
    this.showModal = true;
    this.editingTaskId = task.id;
    this.selectedPriority = task.priority;
    this.newTaskInputValue = task.name;
  }

  sortByPriority(): void {
    this.isPrioritySorted = !this.isPrioritySorted;

    this.isPrioritySorted
      ? this.tasks.sort((a, b) => b.priority - a.priority)
      : this.tasks.sort((a, b) => b.createdAt - a.createdAt);

    this.updateGroups();

    this.saveToLocalStorage();
  }

  saveToLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  ngOnInit(): void {
    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);

      this.updateGroups();
    }
  }
}
