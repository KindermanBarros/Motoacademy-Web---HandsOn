import { Component, ViewChild } from '@angular/core';
import { functionalityData } from '../../shared/functionalityData';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';
import { functionalityDataModal } from '../details-modal/functionalityDataModal';
import { IUser, newUser } from '../../models/user';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { UserService } from '../../services/user.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SearchBarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  funcionalityData: functionalityData = {
    icon: 'bi bi-person fs-2',
    functionalityTitle: 'Usuários',
    functionalityButtonText: 'Usuário',
    functionalitySearchOption: 'Procure por Nome',
  };

  editForm: FormGroup<any>;
  modalInstance!: bootstrap.Modal;
  createForm: FormGroup;
  @ViewChild(DetailsModalComponent) modalComponent!: DetailsModalComponent;
  selectUser: IUser = {
    id: 0,
    name: '',
    email: '',
  };
  newUser: newUser = {
    name: '',
    email: '',
    password: '',
  };
  users: IUser[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  isEditing = false;

  constructor(private userservice: UserService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: [''],
      email: [''],
    });

    this.createForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
    });
  }

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
    );
  }

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
    this.editForm.patchValue({
      name: user.name,
      email: user.email,
    });
    this.selectUser = user;

    const modalElement = document.getElementById('editModalUser');
    if (modalElement) {
      const modal = new Modal(modalElement);

      modal.show();
    } else {
      console.error('Modal não encontrado!');
    }
  }

  deleteUser(id: number) {
    if (!id) return;

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

  updateUser() {
    this.selectUser.name = this.editForm.get('name')?.value;
    this.selectUser.email = this.editForm.get('email')?.value;

    if (this.selectUser && this.selectUser.id) {
      this.userservice
        .updateUser(
          this.selectUser.id,
          this.selectUser.email,
          this.selectUser.name,
          this.selectUser.password
        )
        .subscribe(
          () => {
            this.loadUsers();
          },
          (error) => {
            console.error('Erro ao atualizar user', error);
          }
        );
    }
  }

  openDeleteModal(User: IUser) {
    this.selectUser = User;
  }

  openModal() {
    const modalElement = document.getElementById('createModalUser');
    if (modalElement) {
      const modal = new Modal(modalElement);

      modal.show();
    } else {
      console.error('Modal não encontrado!');
    }
  }

  createUser = () => {
    if (this.createForm.invalid) {
      return;
    }
    this.newUser = {
      name: this.createForm.value.name,
      email: this.createForm.value.email,
      password: this.createForm.value.password,
    };
    this.userservice.createUser(this.newUser).subscribe(() => {
      this.loadUsers();
      this.createForm.reset();
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    });
  };
}
