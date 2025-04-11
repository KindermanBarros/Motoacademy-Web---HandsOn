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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

declare let bootstrap: any;

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatSnackBarModule,
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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
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
  }

  loadUser() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuário não autenticado!');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.userService.getUserById(userId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.user = data;
          this.editForm.patchValue({
            name: data.name,
            email: data.email,
            password: ''
          });
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Erro ao carregar usuário!', err);
          this.errorMessage = 'Erro ao carregar dados do usuário';
          this.showSnackBar('Erro ao carregar dados do usuário', true);

          if (err.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        },
      });
  }

  openProfileModal() {
    this.errorMessage = '';
    this.successMessage = '';

    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
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
      const profileModalInstance =
        bootstrap.Modal.getInstance(profileModalElement);
      if (profileModalInstance) {
        profileModalInstance.hide();
      }
    }

    const editModalElement = document.getElementById('editModal');
    if (editModalElement) {
      const editModal = new bootstrap.Modal(editModalElement);
      editModal.show();
    }
  }

  logout() {
    const profileModalElement = document.getElementById('profileModal');
    if (profileModalElement) {
      const profileModalInstance = bootstrap.Modal.getInstance(profileModalElement);
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
            const editModal = bootstrap.Modal.getInstance(editModalElement);
            if (editModal) {
              editModal.hide();
            }
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
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
    });

    const snackbar = document.getElementById('snackbar');
    if (snackbar) {
      snackbar.textContent = message;
      snackbar.className = 'show';

      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
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
