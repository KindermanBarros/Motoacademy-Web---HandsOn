import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { ServiceOrder } from '../../../models/api-responses';
import { ChartOptions } from '../../../models/chart-models';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class BarChartComponent implements OnInit, OnDestroy {
  chart: any;
  selectedYear: number = new Date().getFullYear();
  yearsList: number[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';
  isEmptyData = false;

  private subscription?: Subscription;
  private months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  private statusDataByYear: { [year: number]: { completed: number[], scheduled: number[], cancelled: number[] } } = {};

  constructor(private dashboardService: DashboardService, private ordersService: OrdersService) {
    const currentYear = new Date().getFullYear();
    this.yearsList = [currentYear];
    this.selectedYear = currentYear;
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
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
    const statusByYearMonth: {
      [year: number]: {
        [month: number]: {
          completed: number,
          scheduled: number,
          cancelled: number
        }
      }
    } = {};

    for (const order of orders) {
      const orderDate = new Date(order.scheduledAt);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth();

      if (!statusByYearMonth[year]) {
        statusByYearMonth[year] = {};
      }

      if (!statusByYearMonth[year][month]) {
        statusByYearMonth[year][month] = {
          completed: 0,
          scheduled: 0,
          cancelled: 0
        };
      }

      switch (order.status) {
        case 'completed':
          statusByYearMonth[year][month].completed++;
          break;
        case 'pending':
          statusByYearMonth[year][month].scheduled++;
          break;
        case 'cancelled':
          statusByYearMonth[year][month].cancelled++;
          break;
      }
    }

    if (Object.keys(statusByYearMonth).length === 0) {
      this.handleEmptyData('Não há dados de status para exibição');
      return;
    }

    this.statusDataByYear = {};
    this.yearsList = [];

    for (const year in statusByYearMonth) {
      if (statusByYearMonth.hasOwnProperty(year)) {
        const yearNum = parseInt(year, 10);
        this.yearsList.push(yearNum);

        this.statusDataByYear[yearNum] = {
          completed: Array(12).fill(0),
          scheduled: Array(12).fill(0),
          cancelled: Array(12).fill(0)
        };

        for (const month in statusByYearMonth[yearNum]) {
          if (statusByYearMonth[yearNum].hasOwnProperty(month)) {
            const monthNum = parseInt(month, 10);
            this.statusDataByYear[yearNum].completed[monthNum] = statusByYearMonth[yearNum][monthNum].completed;
            this.statusDataByYear[yearNum].scheduled[monthNum] = statusByYearMonth[yearNum][monthNum].scheduled;
            this.statusDataByYear[yearNum].cancelled[monthNum] = statusByYearMonth[yearNum][monthNum].cancelled;
          }
        }
      }
    }

    this.yearsList.sort();

    if (!this.statusDataByYear[this.selectedYear]) {
      this.selectedYear = Math.max(...this.yearsList);
    }

    setTimeout(() => {
      this.createBarChart();
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

  createBarChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Chart canvas element not found!');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    try {
      const yearData = this.statusDataByYear[this.selectedYear];
      if (!yearData) {
        this.handleEmptyData('Não há dados disponíveis para o ano selecionado');
        return;
      }

      const hasData = [...yearData.completed, ...yearData.scheduled, ...yearData.cancelled].some(val => val > 0);
      if (!hasData) {
        this.handleEmptyData('Não há dados para o ano selecionado');
        return;
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: `Serviços por Status e Mês - ${this.selectedYear}`,
            color: 'black',
            font: { size: 16 }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      } as ChartOptions;

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.months,
          datasets: [
            {
              label: 'Concluídos',
              backgroundColor: '#4CAF50',
              data: yearData.completed
            },
            {
              label: 'Agendados',
              backgroundColor: '#FFA726',
              data: yearData.scheduled
            },
            {
              label: 'Cancelados',
              backgroundColor: '#9E9E9E',
              data: yearData.cancelled
            }
          ]
        },
        options: options
      });
    } catch (error) {
      console.error('Error creating chart:', error);
      this.handleError('Erro ao criar o gráfico');
    }
  }

  updateChart() {
    if (this.chart && this.statusDataByYear[this.selectedYear]) {
      const yearData = this.statusDataByYear[this.selectedYear];

      this.chart.data.datasets[0].data = yearData.completed;
      this.chart.data.datasets[1].data = yearData.scheduled;
      this.chart.data.datasets[2].data = yearData.cancelled;

      if (this.chart.options && this.chart.options.plugins && this.chart.options.plugins.title) {
        this.chart.options.plugins.title.text = `Serviços por Status e Mês - ${this.selectedYear}`;
      }

      this.chart.update();
    }
  }

  retryLoadData() {
    this.loadChartData();
  }
}
