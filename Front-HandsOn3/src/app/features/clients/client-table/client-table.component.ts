import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { IClient } from '../../../models/client.model';
import * as bootstrap from 'bootstrap';
import { ClientService } from '../../../services/client.service';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../../shared/functionalityData';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SearchBarComponent],
  templateUrl: './client-table.component.html',
  styleUrls: ['./client-table.component.css']
})
export class ClientTableComponent implements AfterViewInit, OnInit {
  funcionalityData: functionalityData = {
      icon: "bi bi-shop fs-2",
      functionalityTitle: "Clientes",
      functionalityButtonText: "Clientes",
      functionalitySearchOption: "Procure por Cliente"
    };

  @ViewChild('detailsModal') modalElement!: ElementRef;
  clienteSelecionado: IClient | null = null;
  modalInstance!: bootstrap.Modal;

  clients: IClient[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  isEditing = false;

  constructor(private clientService: ClientService) {}

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

  ngAfterViewInit() {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  openClientModal(cliente: IClient) {
    this.clienteSelecionado = { ...cliente };
    this.isEditing = false;
    this.modalInstance?.show();
  }

  deleteClient(id: number) {
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
    console.log('toggleEdit', this.isEditing);
    this.isEditing = !this.isEditing;
  }

  updateClient() {
    console.log('updateClient-component');
    if (this.clienteSelecionado) {
      const { id, ...clientData } = this.clienteSelecionado;
      this.clientService.updateClient(id, clientData).subscribe(
        (response) => {
          console.log(response);
          this.loadClients();
          this.modalInstance.hide();
        },
        (error) => {
          console.error('Erro ao atualizar cliente', error);
        }
      );
    }
  }
}
