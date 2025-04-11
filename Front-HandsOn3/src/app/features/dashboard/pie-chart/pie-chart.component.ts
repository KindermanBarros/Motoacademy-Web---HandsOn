import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { ServiceOrder } from '../../../models/api-responses';
import { ChartOptions, PieChartData } from '../../../models/chart-models';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  imports: [FormsModule, CommonModule]
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  pieChart: Chart | null = null;
  selectedYear: number = new Date().getFullYear();

  dataByYear: PieChartData = {};

  yearsList: number[] = [];
  private subscription?: Subscription;

  isLoading = true;
  hasError = false;
  errorMessage = '';
  isEmptyData = false;

  constructor(private dashboardService: DashboardService, private ordersService: OrdersService) {
    const currentYear = new Date().getFullYear();
    this.yearsList = [currentYear];
    this.selectedYear = currentYear;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadChartData();
    }, 0);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }

  private loadChartData() {
    this.isLoading = true;
    this.hasError = false;
    this.isEmptyData = false;

    this.subscription = this.ordersService.getMyOrders().subscribe({
      next: (response: ServiceOrder[] | any) => {
        this.isLoading = false;
        let orders: ServiceOrder[] = [];
        if (Array.isArray(response)) {
          orders = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as any;
          if (responseObj.data && Array.isArray(responseObj.data)) {
            orders = responseObj.data;
          }
        }

        if (orders.length === 0) {
          this.handleEmptyData('Não há ordens de serviço para exibição');
          return;
        }

        this.processOrdersData(orders);
      },
      error: (error) => {
        console.error('Error loading service orders data:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Falha ao conectar com o servidor';
      }
    });
  }

  private processOrdersData(orders: ServiceOrder[]) {
    const statusByYear: { [year: number]: { completed: number, scheduled: number, cancelled: number } } = {};

    for (const order of orders) {
      const scheduledDate = new Date(order.scheduledAt);
      const year = scheduledDate.getFullYear();

      if (!statusByYear[year]) {
        statusByYear[year] = { completed: 0, scheduled: 0, cancelled: 0 };
      }

      switch (order.status) {
        case 'completed':
          statusByYear[year].completed++;
          break;
        case 'pending':
          statusByYear[year].scheduled++;
          break;
        case 'cancelled':
          statusByYear[year].cancelled++;
          break;
      }
    }

    if (Object.keys(statusByYear).length === 0) {
      this.handleEmptyData('Não há dados de status para exibição');
      return;
    }

    this.dataByYear = {};
    this.yearsList = [];

    for (const year in statusByYear) {
      if (statusByYear.hasOwnProperty(year)) {
        const yearNum = parseInt(year, 10);
        this.yearsList.push(yearNum);

        this.dataByYear[yearNum] = [
          statusByYear[year].completed,
          statusByYear[year].scheduled,
          statusByYear[year].cancelled
        ];
      }
    }

    this.yearsList.sort();

    if (!this.dataByYear[this.selectedYear]) {
      this.selectedYear = Math.max(...this.yearsList);
    }

    setTimeout(() => {
      this.createChart();
    }, 0);
  }

  private handleEmptyData(message: string) {
    this.isEmptyData = true;
    this.errorMessage = message;
    this.hasError = false;
  }

  private handleError(message: string) {
    this.hasError = true;
    this.errorMessage = message;
    this.isEmptyData = false;
  }

  createChart() {
    if (!this.pieChartCanvas?.nativeElement) {
      console.error('Chart canvas element not found!');
      return;
    }

    const canvas = this.pieChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context is null!');
      return;
    }

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    try {
      const options: ChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: `Serviços por Status - ${this.selectedYear}`,
            color: 'black',
            font: { size: 16 }
          }
        }
      };

      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Concluídos', 'Agendados', 'Cancelados'],
          datasets: [{
            data: this.dataByYear[this.selectedYear] || [0, 0, 0],
            backgroundColor: ['#4CAF50', '#FFA726', '#9E9E9E']
          }]
        },
        options: options
      });
    } catch (error) {
      console.error('Error creating chart:', error);
      this.handleError('Erro ao criar o gráfico');
    }
  }

  updateChart() {
    if (this.pieChart && this.dataByYear[this.selectedYear]) {
      this.pieChart.data.datasets[0].data = this.dataByYear[this.selectedYear] || [0, 0, 0];
      if (this.pieChart.options && this.pieChart.options.plugins && this.pieChart.options.plugins.title) {
        this.pieChart.options.plugins.title.text = `Serviços por Status - ${this.selectedYear}`;
      }
      this.pieChart.update();
    }
  }

  retryLoadData() {
    this.loadChartData();
  }
}
