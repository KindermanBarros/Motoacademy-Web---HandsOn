import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  searchText = '';

  onSearchChange(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    console.log('Texto digitado:', this.searchText);
  }
}
