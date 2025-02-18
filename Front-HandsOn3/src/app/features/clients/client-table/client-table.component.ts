import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IClient } from '../../../models/client.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-table.component.html',
  styleUrl: './client-table.component.css'
})
export class ClientTableComponent implements AfterViewInit {

  @ViewChild('detailsModal') modalElement!: ElementRef;
  clienteSelecionado: IClient | null = null;
  modalInstance!: bootstrap.Modal;

  clients = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    nome: `Cliente ${i + 1}`,
    cnpj: '00.000.000/0001-00',
    email: `cliente${i + 1}@email.com`
  }));

  currentPage = 1;
  itemsPerPage = 20;
  totalPages = Math.ceil(this.clients.length / this.itemsPerPage);

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
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  openClientModal(cliente: IClient) {
    this.clienteSelecionado = cliente;
    this.modalInstance.show();
  }
}
