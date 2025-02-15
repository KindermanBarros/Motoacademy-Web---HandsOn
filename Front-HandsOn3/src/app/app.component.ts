import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { SearchBarComponent } from "./shared/components/search-bar/search-bar.component";
import { ClientTableComponent } from "./features/clients/client-table/client-table.component";
import { OrdersTableComponent } from './features/orders/orders-table/orders-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SearchBarComponent, OrdersTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Front-HandsOn3';
}
