import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../../shared/functionalityData';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.css'
})
export class OrdersTableComponent {
  funcionalityData: functionalityData = {
    icon: "bi bi-receipt fs-2",
    functionalityTitle: "Ordens de Serviço",
    functionalityButtonText: "Ordem",
    functionalitySearchOption: "Procure por Ordem"
  };

  currentPage = 1;
  pagedOrder = Array.from({ length:15 }, (_,i) => ({
    id: i + 1,
    nome: 'Nome da Ordem',
    client: 'Nome do Cliente',
    date: 'DD/MM/AAAA'
  }))
}

