import { provideRouter, Routes } from '@angular/router';
import { ClientTableComponent } from './features/clients/client-table/client-table.component';
import { OrdersTableComponent } from './features/orders/orders-table/orders-table.component';

export const routes: Routes = [
  { path: 'clients', component: ClientTableComponent },
  { path: 'orders', component: OrdersTableComponent}
];

export const appRouting = provideRouter(routes);
