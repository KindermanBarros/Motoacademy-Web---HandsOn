import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IUser } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';

// declare let bootstrap: any;

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: IUser | undefined;
  editForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  userOptions: boolean = false;
  modalInstance: Modal | null = null;
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadUser();
    this.userOptions = true;
  }

  loadUser() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuário não autenticado!');
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.user = data;
        this.editForm.patchValue({
          name: data.name,
          email: data.email,
        });
      },
      error: () => {
        console.error('Erro ao carregar usuário!');
      },
    });
  }

  openProfileModal() {
    this.errorMessage = '';
    this.successMessage = '';

    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal de perfil não encontrado!');
    }
  }

  openEditModal() {
    this.errorMessage = '';
    this.successMessage = '';

    const profileModalElement = document.getElementById('profileModal');
    if (profileModalElement) {
      const profileModalInstance =  Modal.getInstance(profileModalElement);
      if (profileModalInstance) {
        profileModalInstance.hide();
      }
    }

    const editModalElement = document.getElementById('editModal');
    if (editModalElement) {
      const editModal = new Modal(editModalElement);
      editModal.show();
    }
  }

  logout() {
    const profileModalElement = document.getElementById('profileModal');
    if (profileModalElement) {
      const profileModalInstance = Modal.getInstance(profileModalElement);
      if (profileModalInstance) {
        profileModalInstance.hide();
      }
    }

    this.showSnackBar('Desconectando...', false);

    setTimeout(() => {
      this.authService.logout();
    }, 500);
  }

  updateProfile() {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Usuário não autenticado!';
      this.showSnackBar('Usuário não autenticado!', true);
      return;
    }

    const { name, email, password } = this.editForm.value;
    const updateData: Partial<IUser> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    this.loading = true;
    this.userService.updateUser(userId, updateData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          const editModalElement = document.getElementById('editModal');
          if (editModalElement) {
            const editModal = Modal.getInstance(editModalElement);
            if (editModal) {
              editModal.hide();
            }
            this.error = '';
          }
          this.loadUser();
          this.successMessage = 'Usuário atualizado com sucesso!';
          this.showSnackBar('Usuário atualizado com sucesso!');

          this.authService.updateStoredUser({
            id: userId,
            name: name,
            email: email
          });
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao atualizar usuário!';
          console.error(error);
          this.showSnackBar(this.errorMessage, true);
        },
      });
  }

  showSnackBar(message: string, isError = false) {
    const snackbar = document.getElementById('snackbar');
    if (snackbar) {
      snackbar.textContent = message;
      snackbar.className = `show ${isError ? 'error' : 'success'}`;

      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '').trim();
      }, 3000);
    }
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
