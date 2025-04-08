import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../../shared/functionalityData';
import { OrdersService } from '../../../services/orders.service';
import { ApiResponse, ServiceOrder } from '../../../models/api-responses';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  providers: [DatePipe],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.css'
})
export class OrdersTableComponent implements OnInit {
  funcionalityData: functionalityData = {
    icon: "bi bi-receipt fs-2",
    functionalityTitle: "Ordens de Serviço",
    functionalityButtonText: "Ordem",
    functionalitySearchOption: "Procure por Ordem"
  };

  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;
  orders: ServiceOrder[] = [];
  loading = false;

  constructor(
    private ordersService: OrdersService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  get pagedOrder() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.orders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  loadOrders() {
    this.loading = true;
    
    this.ordersService.getMyOrders().subscribe({
      next: (response) => {
        console.log('Orders response:', response);
        
        if (Array.isArray(response)) {
          this.orders = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as unknown as ApiResponse<ServiceOrder[]>;
          if (responseObj.data && Array.isArray(responseObj.data)) {
            this.orders = responseObj.data;
          } else {
            console.error('Unexpected response format:', response);
            this.orders = [];
          }
        } else {
          this.orders = [];
        }
        
        this.totalPages = Math.max(1, Math.ceil(this.orders.length / this.itemsPerPage));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Erro ao carregar ordens de serviço', 'Fechar', {
          duration: 3000,
        });
        this.orders = [];
        this.totalPages = 1;
        this.loading = false;
      }
    });
  }

  updateOrderStatus(id: number, newStatus: string) {
    this.ordersService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.loadOrders();
        this.snackBar.open('Status atualizado com sucesso', 'Fechar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Erro ao atualizar status', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  deleteOrder(id: number) {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      this.ordersService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
          this.snackBar.open('Ordem excluída com sucesso', 'Fechar', {
            duration: 2000,
          });
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.snackBar.open('Erro ao excluir ordem', 'Fechar', {
            duration: 3000,
          });
        }
      });
    }
  }

  downloadReport(id: number) {
    this.ordersService.getIndividualReport(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${id}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error downloading report:', error)
    });
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return 'text-warning';
    }
  }
}

