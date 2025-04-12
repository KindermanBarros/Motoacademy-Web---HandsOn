import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { functionalityData } from '../../../shared/functionalityData';
import { OrdersService } from '../../../services/orders.service';
import { ApiResponse, ServiceOrder } from '../../../models/api-responses';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import * as bootstrap from 'bootstrap';
import { IClient } from '../../../models/client.model';
import { Subject, finalize, forkJoin, takeUntil } from 'rxjs';
import { ClientStorageService } from '../../../services/client-storage.service';
import { ClientSelectorComponent } from '../../../shared/components/client-selector/client-selector.component';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    ReactiveFormsModule,
    ClientSelectorComponent
  ],
  providers: [DatePipe],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.css'
})
export class OrdersTableComponent implements OnInit, OnDestroy {
  Math = Math;

  @ViewChildren('statusDropdownContainer') statusDropdowns!: QueryList<ElementRef>;

  funcionalityData: functionalityData = {
    icon: "bi bi-receipt fs-2",
    functionalityTitle: "Ordens de Serviço",
    functionalityButtonText: "Ordem",
    functionalitySearchOption: "Procure por Ordem"
  };

  editForm!: FormGroup;
  createForm!: FormGroup;

  selectOrder: ServiceOrder | undefined | null;
  clients: IClient[] = [];
  filteredOrders: ServiceOrder[] = [];
  allOrders: ServiceOrder[] = [];
  searchTerm = '';
  statusFilter = 'all';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  loading = false;

  private createModalInstance: bootstrap.Modal | null = null;
  private editModalInstance: bootstrap.Modal | null = null;
  private deleteModalInstance: bootstrap.Modal | null = null;

  private destroy$ = new Subject<void>();

  createOrderModal = () => {
    this.openCreateModal();
  };

  searchOrders = (term: string) => {
    this.searchTerm = term;
    this.applyFilters();
  };

  setStatusFilterHandler = (status: string) => {
    this.statusFilter = status;
    this.applyFilters();
  };

  constructor(
    private ordersService: OrdersService,
    private clientService: ClientService,
    private clientStorageService: ClientStorageService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
  ) {
    this.createFormGroups();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.closeAllModals();
  }

  private createFormGroups(): void {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      clientId: ['', Validators.required],
      scheduledAt: ['', [Validators.required, this.validateDate.bind(this)]],
      status: ['pending', Validators.required],
      description: ['']
    });

    this.createForm = this.fb.group({
      name: ['', Validators.required],
      clientId: ['', Validators.required],
      scheduledAt: ['', [Validators.required, this.validateDate.bind(this)]],
      description: ['']
    });
  }

  private validateDate(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return { pastOrCurrentDate: true };
    }

    return null;
  }

  private loadInitialData(): void {
    this.loading = true;

    forkJoin({
      clients: this.clientService.getClients(),
      orders: this.ordersService.getMyOrders()
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (results) => {
          this.clients = results.clients || [];
          this.clientStorageService.loadClients().subscribe();
          this.processOrdersResponse(results.orders);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.snackBar.open('Erro ao carregar dados. Por favor, tente novamente.', 'Fechar', {
            duration: 5000,
          });
        }
      });
  }

  private processOrdersResponse(response: any): void {
    if (Array.isArray(response)) {
      this.allOrders = response;
    } else if (response && typeof response === 'object') {
      const responseObj = response as unknown as ApiResponse<ServiceOrder[]>;
      if (responseObj.data && Array.isArray(responseObj.data)) {
        this.allOrders = responseObj.data;
      } else {
        console.error('Unexpected response format:', response);
        this.allOrders = [];
      }
    } else {
      this.allOrders = [];
    }

    this.enrichOrdersWithClientData();
  }

  enrichOrdersWithClientData(): void {
    if (!this.clients.length || !this.allOrders.length) return;

    this.allOrders = this.allOrders.map(order => {
      if (!order) return order;

      const client = this.clients.find(c => c && c.id === order.clientId);
      if (client) {
        return {
          ...order,
          client: {
            id: client.id,
            name: client.name,
            email: client.email || ''
          }
        };
      }
      return order;
    }) as ServiceOrder[];
  }

  applyFilters(): void {
    let filtered = [...this.allOrders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const basicSearchMatch =
          (order.name?.toLowerCase().includes(term)) ||
          (order.description?.toLowerCase().includes(term)) ||
          (order.client?.name?.toLowerCase().includes(term));
        let dateMatch = false;
        if (order.scheduledAt) {
          const orderDate = new Date(order.scheduledAt);

          const dateFormatDDMMYYYY = this.datePipe.transform(orderDate, 'dd/MM/yyyy');

          const dateFormatYYYYMMDD = this.datePipe.transform(orderDate, 'yyyy-MM-dd');

          const dateFormatMonthName = this.datePipe.transform(orderDate, 'MMMM');

          const dayOfMonth = orderDate.getDate().toString();

          dateMatch =
            (dateFormatDDMMYYYY?.toLowerCase().includes(term) || false) ||
            (dateFormatYYYYMMDD?.toLowerCase().includes(term) || false) ||
            (dateFormatMonthName?.toLowerCase().includes(term) || false) ||
            (dayOfMonth === term);
        }

        return basicSearchMatch || dateMatch;
      });
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    filtered.sort((a, b) => {
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    });

    this.filteredOrders = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredOrders.length / this.itemsPerPage));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get pagedOrders(): ServiceOrder[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  openCreateModal(): void {
    this.createForm.reset({
      scheduledAt: new Date().toISOString().split('T')[0]
    });

    this.showModal('createModalOrder', modal => {
      this.createModalInstance = modal;
    });
  }

  openOrderModal(order: ServiceOrder): void {
    if (!order) return;

    this.selectOrder = order;

    try {
      const date = new Date(order.scheduledAt);
      const formattedDate = date.toISOString().split('T')[0];

      this.editForm.patchValue({
        name: order.name || '',
        clientId: order.clientId ? order.clientId.toString() : '',
        scheduledAt: formattedDate,
        status: order.status || 'pending',
        description: order.description || ''
      });

      this.showModal('editModalOrder', modal => {
        this.editModalInstance = modal;
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      this.snackBar.open('Erro ao abrir modal de edição', 'Fechar', {
        duration: 3000
      });
    }
  }

  openDeleteModal(order: ServiceOrder): void {
    if (!order) return;

    this.selectOrder = order;

    this.showModal('deleteModal', modal => {
      this.deleteModalInstance = modal;
    });
  }

  private showModal(modalId: string, callback: (modal: bootstrap.Modal) => void): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      callback(modal);
      modal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }

  private closeAllModals(): void {
    [this.createModalInstance, this.editModalInstance, this.deleteModalInstance]
      .filter(Boolean)
      .forEach(modal => modal?.hide());
  }

  createOrder(): void {
    if (this.createForm.invalid) {
      const dateControl = this.createForm.get('scheduledAt');
      if (dateControl?.errors?.['pastOrCurrentDate']) {
        this.snackBar.open('Não é possível agendar para hoje ou datas passadas', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000
      });
      return;
    }

    const formData = this.createForm.value;
    const clientId = parseInt(formData.clientId as string, 10);
    const clientData = this.clients.find(c => c.id === clientId);

    const newOrder = {
      name: formData.name,
      clientId: clientId,
      clientName: clientData?.name || 'Unknown Client',
      scheduledAt: formData.scheduledAt,
      description: formData.description || ''
    };

    this.loading = true;
    this.ordersService.createOrder(newOrder)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.createModalInstance?.hide();

          if (response) {
            const clientData = this.clients.find(c => c.id === response.clientId);
            if (clientData) {
              response.client = {
                id: clientData.id,
                name: clientData.name,
                email: clientData.email || ''
              };
            }

            this.allOrders.unshift(response);
            this.applyFilters();

            this.snackBar.open('Ordem de serviço criada com sucesso', 'Fechar', {
              duration: 2000,
            });
          }
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.snackBar.open('Erro ao criar ordem de serviço', 'Fechar', {
            duration: 3000,
          });
        }
      });
  }

  updateOrder(): void {
    if (this.editForm.invalid || !this.selectOrder?.id) {
      const dateControl = this.editForm.get('scheduledAt');
      if (dateControl?.errors?.['pastOrCurrentDate']) {
        this.snackBar.open('Não é possível agendar para hoje ou datas passadas', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000
      });
      return;
    }

    const formData = this.editForm.value;
    const orderId = this.selectOrder.id;
    const clientId = parseInt(formData.clientId as string, 10);
    const clientData = this.clients.find(c => c.id === clientId);

    const updatedOrder = {
      name: formData.name,
      clientId: clientId,
      clientName: clientData?.name || 'Unknown Client',
      scheduledAt: formData.scheduledAt,
      status: formData.status,
      description: formData.description || ''
    };

    this.loading = true;
    this.ordersService.updateOrder(orderId, updatedOrder)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.editModalInstance?.hide();

          if (response) {
            const clientData = this.clients.find(c => c.id === response.clientId);
            if (clientData) {
              response.client = {
                id: clientData.id,
                name: clientData.name,
                email: clientData.email || ''
              };
            }

            this.allOrders = this.allOrders.map(order =>
              order.id === response.id ? response : order
            );
            this.applyFilters();

            this.snackBar.open('Ordem de serviço atualizada com sucesso', 'Fechar', {
              duration: 2000,
            });
          }
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.snackBar.open('Erro ao atualizar ordem de serviço', 'Fechar', {
            duration: 3000,
          });
        }
      });
  }

  updateOrderStatus(id: number, newStatus: string, event?: MouseEvent, dropdownId?: string): void {
    if (!id) return;

    const orderIndex = this.allOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) return;

    const order = this.allOrders[orderIndex];

    if (order.status === newStatus) {
      this.closeStatusDropdown(event, dropdownId);
      return;
    }

    this.allOrders = this.allOrders.map((o, index) => {
      if (index === orderIndex) {
        return { ...o, statusLoading: true };
      }
      return o;
    });

    this.applyFilters();

    this.ordersService.updateStatus(id, newStatus)
      .subscribe({
        next: () => {
          this.allOrders = this.allOrders.map(o => {
            if (o.id === id) {
              return {
                ...o,
                status: newStatus,
                statusLoading: false
              };
            }
            return o;
          });

          this.applyFilters();

          this.closeStatusDropdown(event, dropdownId);


          this.snackBar.open(`Status atualizado para ${this.getStatusText(newStatus)}`, 'Fechar', {
            duration: 2000,
          });
        },
        error: (error) => {
          console.error('Error updating status:', error);

          this.allOrders = this.allOrders.map(o => {
            if (o.id === id) {
              return { ...o, statusLoading: false };
            }
            return o;
          });

          this.applyFilters();

          this.closeStatusDropdown(event, dropdownId);

          this.snackBar.open('Erro ao atualizar status', 'Fechar', {
            duration: 3000,
          });
        }
      });
  }

  private closeStatusDropdown(event?: MouseEvent, dropdownId?: string): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setTimeout(() => {
      try {
        if (dropdownId) {
          const dropdownElement = document.getElementById(dropdownId);
          if (dropdownElement) {
            const dropdown = new bootstrap.Dropdown(dropdownElement);
            dropdown.hide();
            return;
          }
        }
        const dropdownElement = event?.target as HTMLElement;
        if (dropdownElement) {
          const dropdownParent = dropdownElement.closest('.dropdown-menu');
          if (dropdownParent) {
            const bootstrapInstance = bootstrap.Dropdown.getInstance(dropdownParent);
            if (bootstrapInstance) {
              bootstrapInstance.hide();
              return;
            }
          }
        }

        document.body.click();
      } catch (e) {
        console.error('Error closing dropdown:', e);
        document.body.click();
      }
    }, 100);
  }

  deleteOrder(): void {
    if (!this.selectOrder?.id) return;

    const orderId = this.selectOrder.id;

    this.loading = true;
    this.ordersService.deleteOrder(orderId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.deleteModalInstance?.hide();

          this.allOrders = this.allOrders.filter(order => order.id !== orderId);
          this.applyFilters();

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

  downloadReport(id: number): void {
    if (!id) return;

    this.loading = true;
    this.ordersService.getIndividualReport(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `order-${id}-report.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          this.snackBar.open('Relatório baixado com sucesso', 'Fechar', {
            duration: 2000,
          });
        },
        error: (error) => {
          console.error('Error downloading report:', error);
          this.snackBar.open('Erro ao baixar relatório', 'Fechar', {
            duration: 3000,
          });
        }
      });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';

    switch (status) {
      case 'completed': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return 'text-warning';
    }
  }

  getStatusText(status: string | undefined): string {
    if (!status) return '';

    switch (status) {
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  onClientSelected(clientId: number | null, formType: 'create' | 'edit'): void {
    const form = formType === 'create' ? this.createForm : this.editForm;
    form.patchValue({ clientId: clientId?.toString() });
  }

  getClientName(order: ServiceOrder): string {
    if (order?.client?.name) {
      return order.client.name;
    }

    if (order?.clientName) {
      return order.clientName;
    }

    if (order?.clientId) {
      const clientFromArray = this.clients.find(c => c.id === order.clientId);
      if (clientFromArray) {
        return clientFromArray.name;
      }

      this.clientStorageService.getClientById(order.clientId).subscribe();
      return `Loading client #${order.clientId}...`;
    }

    return 'N/A';
  }
}

