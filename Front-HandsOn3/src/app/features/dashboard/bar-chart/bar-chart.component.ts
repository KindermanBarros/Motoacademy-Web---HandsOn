import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { ApiResponse, DashboardSummary } from '../../../models/api-responses';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  barChart: any;
  private subscription?: Subscription;
  
  isLoading = true;
  hasError = false;
  errorMessage = '';
  isEmptyData = false;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {
    this.loadChartData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private loadChartData() {
    this.isLoading = true;
    this.hasError = false;
    this.isEmptyData = false;
    
    this.subscription = this.dashboardService.getClientOrdersSummary().subscribe({
      next: (response: ApiResponse<DashboardSummary['clientOrdersSummary']>) => {
        console.log('Dashboard client summary response:', response);
        this.isLoading = false;
        
        if (!response) {
          this.isEmptyData = true;
          this.errorMessage = 'Não foi possível carregar os dados';
          return;
        }
        
        if (!response.success) {
          this.hasError = true;
          this.errorMessage = response.message || 'Erro ao carregar os dados';
          return;
        }
        
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          this.isEmptyData = true;
          this.errorMessage = 'Não há clientes com ordens de serviço cadastradas';
          return;
        }
        
        const clientData = response.data;
        const labels = clientData.map(client => client.name);
        const values = clientData.map(client => client.totalOrders);
        
        // Check if all values are zero
        if (values.every(val => val === 0)) {
          this.isEmptyData = true;
          this.errorMessage = 'Não há ordens de serviço cadastradas';
          return;
        }
        
        this.createChart(labels, values);
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Falha ao conectar com o servidor';
      }
    });
  }

  private createChart(labels: string[], values: number[]) {
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ordens de Serviço por Cliente',
          data: values,
          backgroundColor: '#4CAF50',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: 'Ordens de Serviço por Cliente',
            color: 'black',
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: 'black' }
          },
          x: {
            ticks: { color: 'black' }
          }
        }
      }
    });
  }

  private createFallbackChart() {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio','Junho', 'Julho', 'Agosto','Setembro','Outubro','Novembro','Dezembro'];
    
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Concluídos', data: [50, 75, 80, 90, 100, 500, 100, 40, 60, 80, 120, 90], backgroundColor: '#4CAF50' },
          { label: 'Agendados', data: [30, 40, 50, 60, 70, 100, 100, 30, 40, 50, 80, 70], backgroundColor: '#FFA726' },
          { label: 'Cancelados', data: [10, 15, 20, 25, 30, 100, 100, 10, 20, 30, 40, 20], backgroundColor: '#9E9E9E' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Gráfico de Agendamentos',
            color: 'black',
            font: { size: 16 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Meses',
              color: 'black',
              font: { size: 14 }
            },
            ticks: { color: 'black' }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade',
              color: 'black',
              font: { size: 14 }
            },
            ticks: { color: 'black' },
            beginAtZero: true
          }
        }
      }
    });
  }
  
  retryLoadData() {
    this.loadChartData();
  }
}