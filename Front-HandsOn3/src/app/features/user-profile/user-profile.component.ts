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
import { AuthService } from '../../services/auth.service'; // Importe o AuthService

declare let bootstrap: any;

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: IUser | undefined;
  editForm: FormGroup;
  private userId: number | undefined;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.editForm = this.fb.group({
      name: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
    this.setUserId();
    this.loadUser();
  }

  setUserId() {
    const user = this.authService.getUser();
    this.userId = user?.id;
  }

  loadUser() {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe((data) => {
        this.user = data;
        this.editForm.patchValue(data);
      });
    } else {
      console.error('Usuário não logado ou ID não encontrado!');
    }
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
    console.log('UPDATE');
  }
}
