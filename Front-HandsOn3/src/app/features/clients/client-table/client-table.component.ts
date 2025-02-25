import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { functionalityData } from '../../../shared/functionalityData';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './client-table.component.html',
  styleUrl: './client-table.component.css'
})
export class ClientTableComponent {
  funcionalityData: functionalityData = {
    icon: "bi bi-shop fs-2",
    functionalityTitle: "Clientes",
    functionalityButtonText: "Cliente",
    functionalitySearchOption: "Procure por Nome"
  };

  clients = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    nome: `Cliente ${i + 1}`,
    cnpj: '00.000.000/0001-00',
    email: `cliente${i + 1}@email.com`
  }));

  currentPage = 1;
  itemsPerPage = 20;
  totalPages = Math.ceil(this.clients.length / this.itemsPerPage);


  get pagedClient( ) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.clients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
