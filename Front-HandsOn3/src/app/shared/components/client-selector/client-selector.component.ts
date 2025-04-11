import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { IClient } from '../../../models/client.model';
import { ClientStorageService } from '../../../services/client-storage.service';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-group position-relative">
      <label *ngIf="label" [for]="id" class="form-label">{{label}}</label>
      <div class="input-group">
        <input
          #searchInput
          [id]="id"
          type="text"
          class="form-control"
          placeholder="Search clients..."
          [(ngModel)]="searchText"
          (input)="onSearchInput()"
          (focus)="onInputFocus()"
          (blur)="onInputBlur()"
          [disabled]="disabled"
          [required]="required"
          [class.is-valid]="selectedClient"
        />
        <button 
          class="btn btn-outline-secondary" 
          type="button"
          (click)="onClearSelection()"
          *ngIf="selectedClient && !disabled"
          title="Clear selection">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div 
        #dropdownMenu
        class="dropdown-menu client-search-results" 
        [class.show]="shouldShowDropdown()"
        [style.display]="shouldShowDropdown() ? 'block' : 'none'"
        (mousedown)="$event.preventDefault()">
        <div *ngFor="let client of filteredClients" 
             class="dropdown-item" 
             (mousedown)="selectClient(client)">
          {{ client.name }}
          <small class="text-muted">{{ client.email }}</small>
        </div>
      </div>

      <div *ngIf="selectedClient" class="selected-client mt-2">
        <span class="badge bg-success">
          {{ selectedClient.name }}
          <span class="client-email">{{ selectedClient.email }}</span>
        </span>
      </div>

      <div *ngIf="required && touched && !selectedClient" class="invalid-feedback d-block">
        Client selection is required
      </div>
    </div>
  `,
  styles: [`
    .client-search-results {
      position: absolute;
      width: 100%;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1050;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .dropdown-item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 8px 12px;
    }
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    .dropdown-item small {
      font-size: 0.8rem;
    }
    .selected-client {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .selected-client .badge {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      font-size: 0.9rem;
    }
    .client-email {
      margin-left: 5px;
      font-size: 0.8rem;
      opacity: 0.8;
    }
  `]
})
export class ClientSelectorComponent implements OnInit, OnDestroy {
  @Input() id: string = 'clientSelector';
  @Input() label: string = 'Client';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() minSearchLength: number = 2;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  @Input() set clientId(id: number | null | undefined) {
    if (id) {
      this.clientStorageService.getClientById(id).subscribe(client => {
        if (client) {
          this.selectedClient = client;
          this.searchText = client.name;
          this.isSearchActive = false;
          this.hideDropdown();
        }
      });
    }
  }

  @Output() clientSelected = new EventEmitter<IClient | null>();
  @Output() clientIdSelected = new EventEmitter<number | null>();

  searchText = '';
  filteredClients: IClient[] = [];
  selectedClient: IClient | null = null;
  touched = false;
  isFocused = false;
  isSearchActive = false;
  isDropdownVisible = false;

  private searchInputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private searchTimeout: any;
  private blurTimeout: any;

  constructor(private clientStorageService: ClientStorageService) { }

  ngOnInit(): void {
    this.searchInputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term && term.length >= this.minSearchLength) {
          return this.clientStorageService.searchClientsByName(term);
        }
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.filteredClients = results;
      this.isSearchActive = results.length > 0 && this.isFocused && !this.selectedClient;
      this.isDropdownVisible = this.isSearchActive;

      // Force update of dropdown visibility
      if (!this.isSearchActive || this.selectedClient) {
        this.hideDropdown();
      }
    });

    this.clientStorageService.loadClients().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  // Helper method to forcefully hide dropdown with DOM manipulation if needed
  private hideDropdown(): void {
    this.isSearchActive = false;
    this.isDropdownVisible = false;

    // Use setTimeout to ensure this runs after change detection
    setTimeout(() => {
      if (this.dropdownMenu?.nativeElement) {
        this.dropdownMenu.nativeElement.classList.remove('show');
        this.dropdownMenu.nativeElement.style.display = 'none';
      }
    }, 0);
  }

  shouldShowDropdown(): boolean {
    const shouldShow = this.isSearchActive &&
      this.filteredClients.length > 0 &&
      this.isFocused &&
      !this.selectedClient;

    return shouldShow;
  }

  onSearchInput(): void {
    this.touched = true;

    // If text doesn't match selected client, clear the selection
    if (this.selectedClient && this.searchText !== this.selectedClient.name) {
      this.selectedClient = null;
      this.clientSelected.emit(null);
      this.clientIdSelected.emit(null);
    }

    if (!this.searchText) {
      this.onClearSelection();
      this.hideDropdown();
      return;
    }

    if (this.searchText.length >= this.minSearchLength) {
      this.searchInputSubject.next(this.searchText);
      this.isSearchActive = true;
    } else {
      this.hideDropdown();
    }
  }

  onInputFocus(): void {
    this.isFocused = true;

    // Don't show dropdown if we have a selection
    if (this.selectedClient) {
      this.hideDropdown();
      return;
    }

    if (this.searchText && this.searchText.length >= this.minSearchLength) {
      this.searchInputSubject.next(this.searchText);
    }
  }

  onInputBlur(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    this.blurTimeout = setTimeout(() => {
      this.isFocused = false;
      this.hideDropdown();

      // Auto-select first result if we have text but no selection
      if (this.searchText && !this.selectedClient && this.filteredClients.length > 0) {
        this.selectClient(this.filteredClients[0]);
      }
    }, 200);
  }

  selectClient(client: IClient): void {
    this.selectedClient = client;
    this.searchText = client.name;

    // Ensure dropdown is hidden immediately
    this.hideDropdown();

    this.clientStorageService.saveClientId(client.id);

    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    // Move focus away from input to ensure dropdown stays hidden
    if (document.activeElement === this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.blur();
    }

    this.clientSelected.emit(client);
    this.clientIdSelected.emit(client.id);
  }

  onClearSelection(): void {
    this.selectedClient = null;
    this.searchText = '';
    this.hideDropdown();

    this.clientSelected.emit(null);
    this.clientIdSelected.emit(null);

    // Focus on input after clearing
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }
}