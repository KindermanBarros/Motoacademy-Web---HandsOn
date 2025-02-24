import { Component } from '@angular/core';
import { functionalityData } from '../../shared/functionalityData';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SearchBarComponent, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  funcionalityData: functionalityData = {
      icon: "bi bi-person fs-2",
      functionalityTitle: "Usuários",
      functionalityButtonText: "Usuário",
      functionalitySearchOption: "Procure por Nome"
    };

  currentPage = 1;
  user = Array.from({ length:15 }, (_,i) => ({
    id: i + 1,
    nome: 'Nome do Usuário',
    email: 'user@mail.com',
  }))

  itemsPerPage = 20;
  totalPages = Math.ceil(this.user.length / this.itemsPerPage);


  get pagedUser( ) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.user.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
