import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { ServiceOrder } from '../../../models/api-responses';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-order-calendar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-calendar.component.html',
    styleUrls: ['./order-calendar.component.css']
})
export class OrderCalendarComponent implements OnInit {
    currentMonth: number = new Date().getMonth();
    currentYear: number = new Date().getFullYear();

    months: string[] = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    years: number[] = [];
    days: number[] = [];
    daysInMonth: number = 0;
    firstDayOfMonth: number = 0;
    weekdays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    orders: ServiceOrder[] = [];
    ordersByDate: { [date: string]: ServiceOrder[] } = {};

    isLoading = true;
    hasError = false;
    errorMessage = '';
    private subscription?: Subscription;

    constructor(private ordersService: OrdersService) {
        const currentYear = new Date().getFullYear();
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
    }

    ngOnInit() {
        this.resetToCurrentDate();
        this.loadOrders();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadOrders() {
        this.isLoading = true;
        this.hasError = false;

        this.subscription = this.ordersService.getMyOrders().subscribe({
            next: (response) => {
                if (Array.isArray(response)) {
                    this.orders = response;
                } else if (response && typeof response === 'object') {
                    const responseObj = response as any;
                    if (responseObj.data && Array.isArray(responseObj.data)) {
                        this.orders = responseObj.data;
                    } else {
                        this.orders = [];
                    }
                } else {
                    this.orders = [];
                }

                this.organizeOrdersByDate();
                this.generateCalendar();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading orders for calendar:', error);
                this.isLoading = false;
                this.hasError = true;
                this.errorMessage = 'Falha ao carregar ordens de serviço';
            }
        });
    }

    organizeOrdersByDate() {
        this.ordersByDate = {};

        for (const order of this.orders) {
            const date = new Date(order.scheduledAt);

            if (date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear) {
                const dayKey = date.getDate().toString();

                if (!this.ordersByDate[dayKey]) {
                    this.ordersByDate[dayKey] = [];
                }

                this.ordersByDate[dayKey].push(order);
            }
        }
    }

    generateCalendar() {
        const date = new Date(this.currentYear, this.currentMonth + 1, 0);
        this.daysInMonth = date.getDate();

        const firstDayDate = new Date(this.currentYear, this.currentMonth, 1);
        this.firstDayOfMonth = firstDayDate.getDay();

        const totalCells = this.daysInMonth + this.firstDayOfMonth;
        const totalRows = Math.ceil(totalCells / 7);
        const totalCalendarCells = totalRows * 7;

        this.days = Array.from({ length: totalCalendarCells }, (_, i) => {
            if (i < this.firstDayOfMonth) {
                return 0;
            }

            const dayNumber = i - this.firstDayOfMonth + 1;
            if (dayNumber > this.daysInMonth) {
                return 0;
            }

            return dayNumber;
        });
    }

    changeMonth(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this.currentMonth = parseInt(selectElement.value, 10);
        this.organizeOrdersByDate();
        this.generateCalendar();
    }

    changeYear(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this.currentYear = parseInt(selectElement.value, 10);
        this.organizeOrdersByDate();
        this.generateCalendar();
    }

    getOrdersForDay(day: number): ServiceOrder[] {
        return this.ordersByDate[day.toString()] || [];
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    }

    retryLoadData() {
        this.loadOrders();
    }

    resetToCurrentDate() {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        if (this.orders.length > 0) {
            this.organizeOrdersByDate();
            this.generateCalendar();
        }
    }
}