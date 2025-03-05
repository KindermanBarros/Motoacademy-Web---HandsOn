import { Component, ViewChild } from '@angular/core';
import { functionalityData } from '../../shared/functionalityData';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';
import { functionalityDataModal } from '../details-modal/functionalityDataModal';
import { IUser } from '../../models/user';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SearchBarComponent, CommonModule, DetailsModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  funcionalityData: functionalityData = {
      icon: "bi bi-person fs-2",
      functionalityTitle: "Usuários",
      functionalityButtonText: "Usuário",
      functionalitySearchOption: "Procure por Nome"
    };

    funcionalityDataModal: functionalityDataModal = {
      icon: "",
      functionalityId: 0,
      functionalityname: " ",
      functionalitycnpj: " ",
      functionalitycontact: " ",
    };

   @ViewChild(DetailsModalComponent) modalComponent!: DetailsModalComponent;
     selectUser: IUser | null = null;
     modalInstance!: bootstrap.Modal;

   users: IUser[] = [];
   currentPage = 1;
   itemsPerPage = 20;
   totalPages = 0;
   isEditing = false;

   constructor(private userservice: UserService) {}

   ngOnInit(): void {
    this.loadUsers();
   }

  loadUsers(): void {
    this.userservice.getUsers().subscribe(
      (data: IUser[]) => {
        this.users = data;
        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
      },
      (error) => {
        console.error('Erro ao carregar usuarios', error);
      }
    )
  };

  get pagedUser() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }


  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

   openUserModal(user: IUser) {
     this.funcionalityDataModal = {
       icon: "bi bi-person fs-2",
       functionalityId: user.id,
       functionalityname: user.name,
       functionalitycontact: user.email,
     };

     this.modalComponent?.openModal();
   }

  deleteUser(id: number) {
    if(!id) return;

    this.userservice.deleteUser(id).subscribe(
      () => {
        this.loadUsers();
        if (this.modalInstance) {
          this.modalInstance.hide();
        }
      },
      (error) => {
        console.error('Erro ao excluir Usuario', error);
      }
    );
  }
}
