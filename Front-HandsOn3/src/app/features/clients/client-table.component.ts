import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, ViewChild, OnInit } from '@angular/core';
import { IClient, newClient } from '../../models/client.model';
import * as bootstrap from 'bootstrap';
import { ClientService } from '../../services/client.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../shared/functionalityData';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, ReactiveFormsModule],
  templateUrl: './client-table.component.html',
  styleUrls: ['./client-table.component.css']
})
export class ClientTableComponent implements OnInit {
  funcionalityData: functionalityData = {
    icon: "bi bi-shop fs-2",
    functionalityTitle: "Clientes",
    functionalityButtonText: "Clientes",
    functionalitySearchOption: "Procure por Cliente"
  };

  editForm: FormGroup<any>;
  createForm: FormGroup<any>;
  selectClient: IClient = {
    id: 0,
    name: '',
    email: '',
    cnpj: ''
  };
  newClient: newClient = {
    name: '',
    email: '',
    cnpj: '',
  };
  modalInstance!: bootstrap.Modal;

  clients: IClient[] = [];
  filteredClients: IClient[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  isEditing = false;

  openModal = () => {
    const modalElement = document.getElementById('createModalUser');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal não encontrado!');
    }
  };

  searchClients = (term: string) => {
    this.searchTerm = term;
    this.applyFilters();
  };

  constructor(private clientService: ClientService,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      name: [''],
      cnpj: [''],
      email: [''],
    });

    this.createForm = this.fb.group({
      name: [''],
      cnpj: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(
      (data: IClient[]) => {
        this.clients = data;
        this.applyFilters();
      },
      (error) => {
        console.error('Erro ao carregar clientes', error);
      }
    );
  }

  applyFilters(): void {
    let filtered = [...this.clients];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        (client.name?.toLowerCase().includes(term)) ||
        (client.email?.toLowerCase().includes(term)) ||
        (client.cnpj?.includes(term))
      );
    }

    this.filteredClients = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredClients.length / this.itemsPerPage));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get pagedClient() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }


  openClienteModal(client: IClient) {
    this.editForm.patchValue({
      name: client.name,
      cnpj: client.cnpj,
      email: client.email,
    });
    this.selectClient = client;

    const modalElement = document.getElementById('editModalclient');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal não encontrado!');
    }
  }

  deleteClient(id: number) {
    if (!id) return;

    this.clientService.deleteClient(id).subscribe(
      () => {
        this.loadClients();
        if (this.modalInstance) {
          this.modalInstance.hide();
        }
      },
      (error) => {
        console.error('Erro ao excluir cliente', error);
      }
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  formatCnpj(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 14) {
      value = value.substring(0, 14);
    }


    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)$/, '$1.$2');
    }

    input.value = value;


    if (input.id === 'cnpj') {
      this.editForm.patchValue({ cnpj: value });
    } else if (input.id === 'create-cnpj') {
      this.createForm.patchValue({ cnpj: value });
    }
  }

  private getUnformattedCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  updateClient() {
    this.selectClient.name = this.editForm.get('name')?.value
    this.selectClient.email = this.editForm.get('email')?.value
    const formattedCnpj = this.editForm.get('cnpj')?.value
    this.selectClient.cnpj = this.getUnformattedCnpj(formattedCnpj);

    if (this.selectClient && this.selectClient.id) {
      this.clientService.updateClient(this.selectClient.id, {
        name: this.selectClient.name,
        email: this.selectClient.email,
        cnpj: this.selectClient.cnpj
      }).subscribe(
        () => {
          this.loadClients();
          this.myFunction()
        },
        (error) => {
          console.error('Erro ao atualizar cliente', error);
        }
      );
    }
  }

  openDeleteModal(clientId: IClient) {
    this.selectClient = clientId;
  }

  myFunction(): void {
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

  createClient = () => {
    if (this.createForm.invalid) {
      return;
    }

    const formattedCnpj = this.createForm.get('cnpj')?.value;

    this.newClient = {
      name: this.createForm.value.name,
      email: this.createForm.value.email,
      cnpj: this.getUnformattedCnpj(formattedCnpj)
    };

    this.clientService.createClient(this.newClient).subscribe(() => {
      this.loadClients();
      this.createForm.reset();
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    });
  };

  displayFormattedCnpj(cnpj: string): string {
    if (!cnpj || cnpj.length !== 14) return cnpj;

    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
}
