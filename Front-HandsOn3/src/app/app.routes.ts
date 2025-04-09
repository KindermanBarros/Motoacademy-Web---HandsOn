import { provideRouter, Routes } from '@angular/router';
import { ClientTableComponent } from './features/clients/client-table.component';
import { OrdersTableComponent } from './features/orders/orders-table/orders-table.component';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { UsersComponent } from './features/users/users.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch:'full' },
  { path: 'login', component: LoginComponent },
  {
    path:'',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientTableComponent },
      { path: 'orders', component: OrdersTableComponent},
      { path: 'usuarios', component: UsersComponent}
    ]
  },
];

export const appRouting = provideRouter(routes);
