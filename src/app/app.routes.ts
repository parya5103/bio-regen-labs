import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminPanelComponent } from './admin-panel.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'admin', component: AdminPanelComponent },
];
