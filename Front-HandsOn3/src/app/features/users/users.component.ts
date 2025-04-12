import { Component, OnInit, ViewChild } from '@angular/core';
import { functionalityData } from '../../shared/functionalityData';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';
import { IUser, newUser } from '../../models/user';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { UserService } from '../../services/user.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Modal } from 'bootstrap';
import { catchError, finalize, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SearchBarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  funcionalityData: functionalityData = {
    icon: 'bi bi-person fs-2',
    functionalityTitle: 'Usuários',
    functionalityButtonText: 'Usuário',
    functionalitySearchOption: 'Procure por Nome',
  };

  editForm: FormGroup;
  createForm: FormGroup;
  modalInstance: Modal | null = null;
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
  filteredUsers: IUser[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  isEditing = false;
  loading = false;
  error = '';
  currentUserId: number | null = null;

  openModalFunction = () => this.openModal();
  searchUsers = (term: string) => {
    this.searchTerm = term;
    this.applyFilters();
  };

  constructor(
    private userservice: UserService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    this.createForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.currentUserId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userservice.getUsers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data: IUser[]) => {
          this.users = data;
          this.applyFilters();
          this.error = '';
        },
        error: (error) => {
          console.error('Erro ao carregar usuários', error);
          this.error = 'Erro ao carregar usuários';
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase().includes(term)) ||
        (user.email?.toLowerCase().includes(term))
      );
    }

    this.filteredUsers = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.itemsPerPage));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get pagedUser() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
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
      password: ''
    });
    this.selectUser = { ...user };

    const modalElement = document.getElementById('editModalUser');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement);
      this.modalInstance.show();
    } else {
      console.error('Modal não encontrado!');
    }
  }

  deleteUser(id: number) {
    if (!id) return;

    this.loading = true;
    this.userservice.deleteUser(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.loadUsers();
          const modalElement = document.getElementById('deleteModal');
          if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        },
        error: (error) => {
          console.error('Erro ao excluir usuário', error);
          this.error = error.error?.message || 'Erro ao excluir usuário';

          if (error.status === 403) {
            this.error = 'Você não tem permissão para excluir este usuário';
          }
        }
      });
  }

  updateUser() {
    this.error = '';
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    this.selectUser.name = this.editForm.get('name')?.value;
    this.selectUser.email = this.editForm.get('email')?.value;
    const password = this.editForm.get('password')?.value;

    if (this.selectUser && this.selectUser.id) {
      this.loading = true;

      const userData = {
        name: this.selectUser.name,
        email: this.selectUser.email
      };

      if (password) {
        Object.assign(userData, { password });
      }

      this.userservice.updateUser(this.selectUser.id, userData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.loadUsers();
            const modalElement = document.getElementById('editModalUser');
            if (modalElement) {
              const modal = Modal.getInstance(modalElement);
              if (modal) {
                modal.hide();
              }
            }
            this.error = '';
          },
          error: (error) => {
            console.error('Erro ao atualizar usuário', error);
            this.error = error.error?.message || 'Erro ao atualizar usuário';

            if (error.status === 403) {
              this.error = 'Você não tem permissão para atualizar este usuário';
            } else if (error.status === 400) {
              this.error = 'Dados inválidos. Verifique os campos.';
            }
          }
        });
    }
  }

  openDeleteModal(user: IUser) {
    this.selectUser = { ...user };
  }

  openModal() {
    this.createForm.reset();
    const modalElement = document.getElementById('createModalUser');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal não encontrado!');
    }
  }

  createUser = () => {
    this.error = '';
    if (this.createForm.invalid) {
      this.markFormGroupTouched(this.createForm);
      return;
    }

    this.newUser = {
      name: this.createForm.get('name')?.value,
      email: this.createForm.get('email')?.value,
      password: this.createForm.get('password')?.value,
    };

    this.loading = true;
    this.userservice.createUser(this.newUser)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.createForm.reset();
          const modalElement = document.getElementById('createModalUser');
          if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        },
        error: (error) => {
          console.error('Erro ao criar usuário', error);
          this.error = error.error?.message || 'Erro ao criar usuário';

          if (error.status === 409) {
            this.error = 'Email já está em uso';
          } else if (error.status === 400) {
            this.error = 'Dados inválidos. Verifique os campos.';
          }
        }
      });
  };

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  canEditUser(userId: number): boolean {
    return this.currentUserId === userId || this.authService.isAdmin();
  }
}
