import { Routes } from '@angular/router';
import { OrdersTableComponent } from './features/orders/orders-table/orders-table.component';
import { ClientTableComponent } from './features/clients/client-table/client-table.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'relatorios', component: ClientTableComponent },
  { path: 'clientes', component: ClientTableComponent },
  { path: 'servicos', component: OrdersTableComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/dashboard' } 
];
