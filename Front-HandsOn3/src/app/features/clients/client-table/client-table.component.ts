import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-table.component.html',
  styleUrl: './client-table.component.css'
})
export class ClientTableComponent {
  currentPage = 1;
  pagedClient = Array.from({ length:15 }, (_,i) => ({
    id: i + 1,
    nome: 'Nome do Cliente',
    cnpj: '00.000.000/0001-00',
    email: 'cliente@email.com'
  }))
}
