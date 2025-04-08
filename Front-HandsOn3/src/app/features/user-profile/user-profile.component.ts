import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IUser } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  snackbar: HTMLElement | null | undefined;
  user: IUser | undefined;
  editForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadUser();
    // this.editForm.controls['name'].disable();
    // this.editForm.controls['email'].disable();
  }

  loadUser() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Usuário não autenticado!');
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.user = data;
        // this.editForm.patchValue(data);
      },
      error: () => {
        console.error('Erro ao carregar usuário!');
      },
    });
  }

  openProfileModal() {
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal de perfil não encontrado!');
    }
  }

  openEditModal() {
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

  updateProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Usuário não autenticado!';
      return;
    }

    const { name, email, password } = this.editForm.value;

<<<<<<< HEAD
    this.userService.updateUser(userId, name, email, password).subscribe({
=======
    this.userService.updateUser(userId, {
      name,
      email,
      password
    }).subscribe({
>>>>>>> a1327d9 (Refactor Backend functionalities and partially integrate to frontend)
      next: (response) => {
        const editModalElement = document.getElementById('editModal');
        if (editModalElement) {
          const editModal = bootstrap.Modal.getInstance(editModalElement);
          if (editModal) {
            editModal.hide();
          }
        }
        this.loadUser();
<<<<<<< HEAD
        this.FunctionSnackBar();
        //   duration: 3000,
        //   panelClass: ['snack-bar-success'],
        // });
=======
        this.myFunction();
>>>>>>> a1327d9 (Refactor Backend functionalities and partially integrate to frontend)
      },
      error: (error) => {
        this.errorMessage = 'Erro ao atualizar usuário!';
        console.error(error);
      },
    });
  }

<<<<<<< HEAD
  FunctionSnackBar(): void {
=======
  myFunction(): void {
>>>>>>> a1327d9 (Refactor Backend functionalities and partially integrate to frontend)
    const snackbar = document.getElementById('snackbar');

    if (snackbar) {
      snackbar.className = 'show';

      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
      }, 3000);
    } else {
      console.warn('Elemento com id "snackbar" não encontrado.');
    }
  }
}
