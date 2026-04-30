import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  owner: string;
  createdTime: Timestamp;
  priority: string;
  parentId?: string;
  order?: number;
}

export interface TaskWithSubtasks {
  maintask: Task;
  subtasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  
  currentUser$ = user(this.auth);
  currentUser: any = null;
  localUid = 'guest';

  firestoreReady = of(true);

  tasks$: Observable<Task[]> = this.currentUser$.pipe(
    switchMap(u => {
      this.currentUser = u;
      const uid = u?.uid || this.localUid;
      return collectionData(
        query(collection(this.firestore, 'tasks'), where('owner', '==', uid), where('parentId', '==', null), orderBy('createdTime', 'desc'))
      ) as Observable<Task[]>;
    })
  );

  constructor() {
    this.currentUser$.subscribe(u => this.currentUser = u);
  }

  createTaskRef() {
    return doc(collection(this.firestore, 'tasks'));
  }

  loadSubtasks(parentId: string): Observable<Task[]> {
    return collectionData(
      query(collection(this.firestore, 'tasks'), where('parentId', '==', parentId), orderBy('order', 'asc'))
    ) as Observable<Task[]>;
  }

  async generateTask(data: { file?: File, prompt: string }): Promise<{ title: string, subtasks: string[] }> {
    return {
      title: "Planned Task: " + data.prompt.substring(0, 20),
      subtasks: ["Task 1", "Task 2", "Task 3"]
    };
  }

  addMaintaskWithSubtasks(maintask: Task, subtasks: Task[]) {
    addDoc(collection(this.firestore, 'tasks'), maintask);
    subtasks.forEach(s => addDoc(collection(this.firestore, 'tasks'), s));
  }

  updateTask(task: Task) {
    const taskRef = doc(this.firestore, 'tasks', task.id);
    return updateDoc(taskRef, { ...task });
  }

  deleteMaintaskAndSubtasks(id: string) {
    deleteDoc(doc(this.firestore, 'tasks', id));
  }

  handleError(error: any, message: string | undefined, duration: number) {
    console.error(message, error);
  }
}
