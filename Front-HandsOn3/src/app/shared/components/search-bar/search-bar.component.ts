import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { functionalityData } from '../../functionalityData';
import { Input } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Input() functionalityData: functionalityData | undefined;
  @Input() functionCreate?: () => void | undefined;
  @Input() functionSearch?: (searchText: string) => void;
  @Input() showStatusFilter: boolean = false;
  @Input() currentStatusFilter: string = 'all';
  @Input() setStatusFilter?: (status: string) => void;

  searchText = '';

  onSearchChange(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    console.log('Texto digitado:', this.searchText);

    if (this.functionSearch) {
      this.functionSearch(this.searchText);
    }
  }
}
