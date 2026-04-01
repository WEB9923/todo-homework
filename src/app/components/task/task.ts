import { Component, OnInit } from '@angular/core';
import {
  LucideCheck,
  LucideCirclePlus,
  LucideCircleX,
  LucideEllipsis,
  LucidePencil,
  LucideSettings2,
  LucideTrash2,
} from '@lucide/angular';
import { TaskModel, TaskPriority } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { v4 as uuidV4 } from 'uuid';
import { format, isToday, isYesterday } from 'date-fns';

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

  selectedPriority: TaskPriority = TaskPriority.LOW;

  tasks: TaskModel[] = [];
  groupedTasks: { [key: string]: TaskModel[] } = {};
  groupLabels: string[] = [];

  toggleShowMenu = (): boolean => (this.showMenu = !this.showMenu);

  handleShowModal(): void {
    this.showMenu = false;
    this.showModal = true;
  }

  handleCloseModal = (): boolean => (this.showModal = false);

  handleAddNewTask(evt: SubmitEvent): void {
    evt.preventDefault();

    if (!this.newTaskInputValue.trim()) return;

    const newTask: TaskModel = {
      id: uuidV4(),
      name: this.newTaskInputValue,
      completed: false,
      createdAt: Date.now(),
      priority: this.selectedPriority,
    };

    this.tasks.unshift(newTask);
    this.updateGroups();

    this.newTaskInputValue = '';
    this.selectedPriority = TaskPriority.LOW;

    this.handleCloseModal();

    this.saveToLocalStorage();
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
