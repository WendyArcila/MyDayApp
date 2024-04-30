import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  computed,
  effect,
} from '@angular/core';

import { Task } from './../../models/taks.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  tasks = signal<Task[]>([]);
  //el effect hace traking, es decir está pendiente cuando algo cambie
  // y respecto a eso ejecuta una lógica, no retorna, se ejecuta cada que
  // haya un cambio en la signal que se usa dentro
  constructor() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
  }

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
  }

  filter = signal('all');
  //es parecido al traking, pero este siempre retorna, es decir calcula un
  //nuevo esta apartir de otros.
  taskByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'pending') {
      return tasks.filter((task) => !task.completed);
    }
    if (filter === 'completed') {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  });

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  editTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  editTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            editing: true,
          };
        }
        return {
          ...task,
          editing: false,
        };
      });
    });
  }

  ediTitleTask(index: number) {
    const newTitle = this.editTaskCtrl.value.trim();
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (newTitle !== '') {
          if (position === index) {
            return {
              ...task,
              title: newTitle,
              editing: false,
            };
          }
        }
        return task;
      });
    });
  }

  changeHandler() {
    if (this.newTaskCtrl.valid) {
      const value = this.newTaskCtrl.value.trim();
      if (value !== '') {
        this.addTask(value);
        this.newTaskCtrl.setValue('');
      }
    }
  }

  addTask(title: string) {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  updateTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task;
      });
    });
  }

  deleteTask(index: number) {
    this.tasks.update((tasks) =>
      tasks.filter((task, position) => position !== index)
    );
  }

  changeFilter(filter: string) {
    this.filter.set(filter);
  }
}
