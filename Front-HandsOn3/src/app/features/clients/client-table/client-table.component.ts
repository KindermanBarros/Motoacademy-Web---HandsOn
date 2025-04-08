import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, ViewChild, OnInit } from '@angular/core';
import { IClient } from '../../../models/client.model';
import * as bootstrap from 'bootstrap';
import { ClientService } from '../../../services/client.service';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../../shared/functionalityData';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent,ReactiveFormsModule],
  templateUrl: './client-table.component.html',
  styleUrls: ['./client-table.component.css']
})
export class ClientTableComponent implements  OnInit {
  funcionalityData: functionalityData = {
    icon: "bi bi-shop fs-2",
    functionalityTitle: "Clientes",
    functionalityButtonText: "Clientes",
    functionalitySearchOption: "Procure por Cliente"
  };

  editForm: FormGroup<any>;
  selectClient: IClient = {
    id: 0,
    name: '',
    email: '',
    cnpj:''
  };
  modalInstance!: bootstrap.Modal;

  clients: IClient[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  isEditing = false;

  constructor(private clientService: ClientService,
     private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
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
        this.totalPages = Math.ceil(this.clients.length / this.itemsPerPage);
      },
      (error) => {
        console.error('Erro ao carregar clientes', error);
      }
    );
  }

  get pagedClient() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.clients.slice(startIndex, startIndex + this.itemsPerPage);
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
    if(!id) return;

    this.clientService.deleteClient(id).subscribe(
      () => {
        this.loadClients();
        if (this.modalInstance) {
          // this.modalInstance.hide();
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

  updateClient() {
    this.selectClient.name = this.editForm.get('name')?.value
    this.selectClient.email = this.editForm.get('email')?.value
    this.selectClient.cnpj = this.editForm.get('cnpj')?.value

    if (this.selectClient) {
      this.clientService.updateClient(this.selectClient).subscribe(
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
}
