import { AuthService } from './../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.router.navigate(['/clients']);
      },
      error: () => {
        alert('Credenciais inválidas.');
      },
    });
  }
}
