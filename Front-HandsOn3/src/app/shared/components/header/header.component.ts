import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserProfileComponent } from "../../../features/user-profile/user-profile.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, UserProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
